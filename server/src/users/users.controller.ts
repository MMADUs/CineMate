import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAccessGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* Get Profile Controller
   * @desc: Get authenticated user's profile
   * @route: /users/profile
   * @param: AuthUser
   * @returns: Promise<UserProfileResponseDto>
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  getProfile(@CurrentUser() user: AuthUser): Promise<UserProfileResponseDto> {
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
  @ApiOperation({ summary: 'Update authenticated user profile' })
  @ApiOkResponse({ type: UserProfileResponseDto })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.userId, dto);
  }
}
