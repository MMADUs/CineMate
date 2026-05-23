import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAccessGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* Get Profile Controller
   * @desc: Get authenticated user's profile
   * @route: /users/profile
   * @param: AuthUser
   * @returns: UserProfileResponseDto
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@CurrentUser() user: AuthUser): UserProfileResponseDto {
    return this.usersService.getProfile(user.userId);
  }

  /* Update Profile Controller
   * @desc: Update authenticated user's profile
   * @route: /users/profile
   * @param: AuthUser, UpdateProfileDto
   * @returns: Promise<UserProfileResponseDto>
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.userId, dto);
  }
}
