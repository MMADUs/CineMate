import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { users } from '../database/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE) 
    private readonly db: BetterSQLite3Database<typeof schema>,
  ) {}

  /* Get Profile Service
   * @desc: Get authenticated user's profile
   * @param: userId
   * @returns: UserProfileResponseDto
   */
  getProfile(userId: number): UserProfileResponseDto {
    const user = this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .get();

    // check if user doesn't exist
    if (!user) throw new NotFoundException('User not found');

    return this.serializeUser(user);
  }

  /* Update Profile Service
   * @desc: Update authenticated user's profile
   * @param: userId, UpdateProfileDto
   * @returns: Promise<UserProfileResponseDto>
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    // build update user data
    const update = {
      ...(dto.fullName ? { fullName: dto.fullName } : {}),
      ...(dto.phoneNum ? { phoneNum: dto.phoneNum } : {}),
      ...(dto.password ? { password: await argon2.hash(dto.password) } : {}),
    };

    // update user
    const user = this.db
      .update(users)
      .set(update)
      .where(eq(users.userId, userId))
      .returning()
      .get();

    // check if user doesn't exist
    if (!user) throw new NotFoundException('User not found');

    return this.serializeUser(user);
  }

  /* Serialize User Helper
   * @desc: Remove sensitive fields from user response
   * @param: user
   * @returns: UserProfileResponseDto
   */
  private serializeUser<
    T extends UserProfileResponseDto & {
      password?: string;
      refreshTokenHash?: string | null;
    },
  >(user: T): UserProfileResponseDto {
    const safeUser = { ...user };

    // remove sensitive fields
    delete safeUser.password;
    delete safeUser.refreshTokenHash;

    return safeUser;
  }
}
