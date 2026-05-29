import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { eq, or } from 'drizzle-orm';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { users } from '../database/schema';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from '../common/interfaces/auth-user.interface';
import {
  AuthUserResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
  TokenPair,
} from './dto/auth-response.dto';

interface GoogleTokenInfo {
  sub: string;
  aud: string;
  email: string;
  email_verified: string | boolean;
  name?: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /* Register Service
   * @desc: Register a new user
   * @param: RegisterDto, Response
   * @returns: Promise<AuthUserResponseDto>
   */
  async register(
    dto: RegisterDto,
    res: Response,
  ): Promise<AuthUserResponseDto> {
    // check if email already exists
    const [existing] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    // check if email already exist
    if (existing) throw new ConflictException('Email is already registered');

    // hash password and insert user
    const userId = randomUUID();
    await this.db.insert(users).values({
      userId,
      ...dto,
      authProvider: 'LOCAL',
      password: await argon2.hash(dto.password),
    });

    // retrieve user from database
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

    // issue tokens
    const tokens = await this.issueTokens(user.userId, user.email);

    // save refresh token
    await this.saveRefreshHash(user.userId, tokens.refreshToken);

    // set cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return this.serializeUser(user);
  }

  /* Login Service
   * @desc: Login a user
   * @param: LoginDto, Response
   * @returns: Promise<AuthUserResponseDto>
   */
  async login(dto: LoginDto, res: Response): Promise<AuthUserResponseDto> {
    // check if user exists by email
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, dto.email));

    // if email doesn't exist or password is incorrect
    if (
      !user?.password ||
      !(await argon2.verify(user.password, dto.password))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // issue tokens
    const tokens = await this.issueTokens(user.userId, user.email);

    // save refresh token
    await this.saveRefreshHash(user.userId, tokens.refreshToken);

    // set cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return this.serializeUser(user);
  }

  /* Google Auth Service
   * @desc: Verify Google ID token, create or link a user, and set auth cookies
   * @param: GoogleAuthDto, Response
   * @returns: Promise<AuthUserResponseDto>
   */
  async google(
    dto: GoogleAuthDto,
    res: Response,
  ): Promise<AuthUserResponseDto> {
    const tokenInfo = await this.verifyGoogleIdToken(dto.idToken);

    // find existing user by google id or email
    const [existing] = await this.db
      .select()
      .from(users)
      .where(
        or(eq(users.googleId, tokenInfo.sub), eq(users.email, tokenInfo.email)),
      );

    let user = existing;

    // if user doesn't exist
    if (!user) {
      const fullName = (tokenInfo.name ?? tokenInfo.email).slice(0, 50);

      // register new user with google account
      const userId = randomUUID();
      await this.db.insert(users).values({
        userId,
        fullName,
        email: tokenInfo.email,
        phoneNum: null,
        password: null,
        authProvider: 'GOOGLE',
        googleId: tokenInfo.sub,
        avatarUrl: tokenInfo.picture ?? null,
      });

      // retrieve newly created user
      const [created] = await this.db
        .select()
        .from(users)
        .where(eq(users.userId, userId));

      user = created;
      // if user exists but google id doesn't match
    } else if (user.googleId && user.googleId !== tokenInfo.sub) {
      throw new UnauthorizedException('Google account does not match user');
      // if user exists but google id is null
    } else if (!user.googleId) {
      // link google account to existing user
      await this.db
        .update(users)
        .set({
          googleId: tokenInfo.sub,
          avatarUrl: tokenInfo.picture ?? user.avatarUrl,
        })
        .where(eq(users.userId, user.userId));

      // retrieve newly created user
      const [linked] = await this.db
        .select()
        .from(users)
        .where(eq(users.userId, user.userId));

      user = linked;
    }

    // issue tokens
    const tokens = await this.issueTokens(user.userId, user.email);

    // save refresh token
    await this.saveRefreshHash(user.userId, tokens.refreshToken);

    // set cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return this.serializeUser(user);
  }

  /* Refresh Service
   * @desc: Refresh access token
   * @param: AuthUser, Response
   * @returns: Promise<RefreshResponseDto>
   */
  async refresh(user: AuthUser, res: Response): Promise<RefreshResponseDto> {
    // check if user exists by id
    const [found] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, user.userId));

    // check if user doesn't exist or refresh token is invalid
    if (
      !found?.refreshTokenHash ||
      !user.refreshToken ||
      !(await argon2.verify(found.refreshTokenHash, user.refreshToken))
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // issue tokens
    const tokens = await this.issueTokens(found.userId, found.email);

    // save refresh token
    await this.saveRefreshHash(found.userId, tokens.refreshToken);

    // set cookies
    this.setCookies(res, tokens.accessToken, tokens.refreshToken);

    return { user: this.serializeUser(found) };
  }

  /* Logout Service
   * @desc: Logout a user
   * @param: AuthUser, Response
   * @returns: LogoutResponseDto
   */
  async logout(user: AuthUser, res: Response): Promise<LogoutResponseDto> {
    await this.db
      .update(users)
      .set({ refreshTokenHash: null })
      .where(eq(users.userId, user.userId));

    this.clearCookies(res);

    return { message: 'Logged out' };
  }

  /* Issue Tokens Helper
   * @desc: Issue access and refresh tokens
   * @param: userId, email
   * @returns: Promise<TokenPair>
   */
  private async issueTokens(userId: string, email: string): Promise<TokenPair> {
    const payload = { sub: userId, email };

    // issue access token
    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ??
        'dev-access-secret',
      expiresIn: 15 * 60,
    });

    // issue refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        'dev-refresh-secret',
      expiresIn: 7 * 24 * 60 * 60,
    });

    return { accessToken, refreshToken };
  }

  /* Save Refresh Hash Helper
   * @desc: Save refresh token hash
   * @param: userId, refreshToken
   * @returns: Promise<void>
   */
  private async saveRefreshHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    // update user's refresh token hash
    await this.db
      .update(users)
      .set({ refreshTokenHash: await argon2.hash(refreshToken) })
      .where(eq(users.userId, userId));
  }

  /* Verify Google ID Token Helper
   * @desc: Verify token authenticity and audience with Google tokeninfo
   * @param: idToken
   * @returns: GoogleTokenInfo
   */
  private async verifyGoogleIdToken(idToken: string): Promise<GoogleTokenInfo> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new InternalServerErrorException(
        'GOOGLE_CLIENT_ID is not configured',
      );
    }

    // fetch Google tokeninfo
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        idToken,
      )}`,
    );

    const body = (await response.json()) as Partial<GoogleTokenInfo> & {
      error_description?: string;
    };

    if (!response.ok || !body.sub || !body.email || !body.aud) {
      throw new UnauthorizedException('Invalid Google ID token');
    }

    if (body.aud !== clientId) {
      throw new UnauthorizedException('Invalid Google token audience');
    }

    if (body.email_verified !== true && body.email_verified !== 'true') {
      throw new BadRequestException('Google email is not verified');
    }

    return body as GoogleTokenInfo;
  }

  /* Set Cookies Helper
   * @desc: Set access and refresh tokens in cookies
   * @param: Response, accessToken, refreshToken
   * @returns: void
   */
  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';

    // set access token cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    // set refresh token cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  /* Clear Cookies Helper
   * @desc: Clear access and refresh tokens from cookies
   * @param: Response
   * @returns: void
   */
  private clearCookies(res: Response): void {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }

  /* Serialize User Helper
   * @desc: Remove sensitive fields from user response
   * @param: user
   * @returns: UserProfileResponseDto
   */
  private serializeUser<
    T extends AuthUserResponseDto & {
      password?: string | null;
      refreshTokenHash?: string | null;
      googleId?: string | null;
    },
  >(user: T): AuthUserResponseDto {
    const safeUser = { ...user };

    // remove sensitive fields
    delete safeUser.password;
    delete safeUser.refreshTokenHash;
    delete safeUser.googleId;

    return safeUser;
  }
}
