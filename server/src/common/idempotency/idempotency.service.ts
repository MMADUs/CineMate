import {
  ConflictException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../../database/database.constants';
import * as schema from '../../database/schema';
import { idempotencyKeys } from '../../database/schema';

export interface IdempotencyCreateParams {
  key: string;
  scope: string;
  method: string;
  route: string;
  requestHash: string;
}

export interface IdempotencyRecord {
  idempotencyKeyId: number;
  key: string;
  scope: string;
  method: string;
  route: string;
  requestHash: string;
  status: string;
  responseStatus: number | null;
  responseBody: string | null;
}

@Injectable()
export class IdempotencyService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
    private readonly configService: ConfigService,
  ) {}

  /* Is Enabled Helper
   * @desc: Check whether idempotency protection is enabled by env flag
   * @param: none
   * @returns: boolean
   */
  isEnabled(): boolean {
    return this.configService.get<string>('IDEMPOTENCY_FLAG') === 'true';
  }

  /* Hash Request Helper
   * @desc: Build a deterministic request hash for an idempotent operation
   * @param: method, route, body
   * @returns: string
   */
  hashRequest(method: string, route: string, body: unknown): string {
    return createHash('sha256')
      .update(
        JSON.stringify({
          method,
          route,
          body: this.stableValue(body),
        }),
      )
      .digest('hex');
  }

  /* Create Processing Record Service
   * @desc: Reserve an idempotency key before running protected business logic
   * @param: IdempotencyCreateParams
   * @returns: Promise<IdempotencyRecord | null>
   */
  async createProcessingRecord(
    params: IdempotencyCreateParams,
  ): Promise<IdempotencyRecord | null> {
    const now = new Date();
    const ttlHours = Number(
      this.configService.get<number>('IDEMPOTENCY_TTL_HOURS') ?? 24,
    );
    const lockedUntil = new Date(now.getTime() + 60_000);
    const expiresAt = new Date(now.getTime() + ttlHours * 60 * 60 * 1000);

    try {
      const [inserted] = await this.db
        .insert(idempotencyKeys)
        .values({
          key: params.key,
          scope: params.scope,
          method: params.method,
          route: params.route,
          requestHash: params.requestHash,
          status: 'PROCESSING',
          lockedUntil: this.toMysqlTimestamp(lockedUntil),
          expiresAt: this.toMysqlTimestamp(expiresAt),
          updatedAt: this.toMysqlTimestamp(now),
        })
        .$returningId();

      const [record] = await this.db
        .select()
        .from(idempotencyKeys)
        .where(eq(idempotencyKeys.idempotencyKeyId, inserted.idempotencyKeyId));

      return record;
    } catch (error) {
      if (!this.isDuplicateKeyError(error)) throw error;

      return null;
    }
  }

  /* Find Record Service
   * @desc: Find an idempotency record by scope and key
   * @param: scope, key
   * @returns: Promise<IdempotencyRecord | null>
   */
  async findRecord(
    scope: string,
    key: string,
  ): Promise<IdempotencyRecord | null> {
    const [record] = await this.db
      .select()
      .from(idempotencyKeys)
      .where(
        and(eq(idempotencyKeys.scope, scope), eq(idempotencyKeys.key, key)),
      );

    return record ?? null;
  }

  /* Complete Record Service
   * @desc: Persist the successful response for future retries
   * @param: record ID, status code, response body
   * @returns: Promise<void>
   */
  async completeRecord(
    idempotencyKeyId: number,
    responseStatus: number,
    responseBody: unknown,
  ): Promise<void> {
    await this.db
      .update(idempotencyKeys)
      .set({
        status: 'COMPLETED',
        responseStatus,
        responseBody: JSON.stringify(responseBody),
        lockedUntil: null,
        updatedAt: this.toMysqlTimestamp(new Date()),
      })
      .where(eq(idempotencyKeys.idempotencyKeyId, idempotencyKeyId));
  }

  /* Fail Record Service
   * @desc: Release a processing record when business logic fails
   * @param: record ID
   * @returns: Promise<void>
   */
  async failRecord(idempotencyKeyId: number): Promise<void> {
    await this.db
      .update(idempotencyKeys)
      .set({
        status: 'FAILED',
        lockedUntil: null,
        updatedAt: this.toMysqlTimestamp(new Date()),
      })
      .where(eq(idempotencyKeys.idempotencyKeyId, idempotencyKeyId));
  }

  /* Resolve Duplicate Record Helper
   * @desc: Convert an existing record into a cached response or retry error
   * @param: record, request hash
   * @returns: unknown
   */
  resolveDuplicateRecord(
    record: IdempotencyRecord | null,
    requestHash: string,
  ) {
    if (!record) {
      throw new ConflictException(
        'Idempotency key is already processing. Retry the same request later',
      );
    }

    if (record.requestHash !== requestHash) {
      throw new ConflictException(
        'Idempotency key was already used with a different request payload',
      );
    }

    if (record.status === 'COMPLETED' && record.responseBody) {
      return JSON.parse(record.responseBody) as unknown;
    }

    if (record.status === 'FAILED') {
      throw new ConflictException(
        'Previous request with this idempotency key failed. Use a new key to retry',
      );
    }

    throw new ConflictException(
      'Idempotency key is already processing. Retry the same request later',
    );
  }

  /* Build Scope Helper
   * @desc: Build the idempotency scope for authenticated users/admins
   * @param: request user
   * @returns: string
   */
  buildScope(user: unknown): string {
    const auth = user as { userId?: string; adminId?: number } | undefined;

    if (auth?.userId) return `user:${auth.userId}`;
    if (auth?.adminId) return `admin:${auth.adminId}`;

    throw new ServiceUnavailableException(
      'Idempotency requires an authenticated request scope',
    );
  }

  /* Stable Value Helper
   * @desc: Sort object keys before hashing request bodies
   * @param: value
   * @returns: unknown
   */
  private stableValue(value: unknown): unknown {
    if (Array.isArray(value))
      return value.map((item) => this.stableValue(item));

    if (value && typeof value === 'object') {
      return Object.keys(value)
        .sort()
        .reduce<Record<string, unknown>>((result, key) => {
          result[key] = this.stableValue(
            (value as Record<string, unknown>)[key],
          );
          return result;
        }, {});
    }

    return value;
  }

  /* Duplicate Key Error Helper
   * @desc: Detect MySQL duplicate key errors
   * @param: error
   * @returns: boolean
   */
  private isDuplicateKeyError(error: unknown): boolean {
    const mysqlError = error as { code?: string; errno?: number };

    return mysqlError.code === 'ER_DUP_ENTRY' || mysqlError.errno === 1062;
  }

  /* MySQL Timestamp Helper
   * @desc: Format Date values for MySQL timestamp string columns
   * @param: date
   * @returns: string
   */
  private toMysqlTimestamp(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
}
