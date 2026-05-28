import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { DRIZZLE } from '../database/database.constants';
import * as schema from '../database/schema';
import { users } from '../database/schema';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: MySql2Database<typeof schema>,
  ) {}

  /* Get Profile Service
   * @desc: Get authenticated user's profile
   * @param: userId
   * @returns: UserProfileResponseDto
   */
  async getProfile(userId: number): Promise<UserProfileResponseDto> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

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
    await this.db.update(users).set(update).where(eq(users.userId, userId));

    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.userId, userId));

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
