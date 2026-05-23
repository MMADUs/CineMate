import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAccessGuard } from '../common/guards/jwt-access.guard';
import { JwtRefreshGuard } from '../common/guards/jwt-refresh.guard';
import type { AuthUser } from '../common/interfaces/auth-user.interface';
import { AuthService } from './auth.service';
import {
  AuthMeResponseDto,
  AuthUserResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /* Register Controller
   * @desc: Register a new user
   * @route: /auth/register
   * @param: RegisterDto, Response
   * @returns: Promise<AuthUserResponseDto>
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: AuthUserResponseDto })
  register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    return this.authService.register(dto, res);
  }

  /* Login Controller
   * @desc: Login a user
   * @route: /auth/login
   * @param: LoginDto, Response
   * @returns: Promise<AuthUserResponseDto>
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user and set HttpOnly auth cookies' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthUserResponseDto> {
    return this.authService.login(dto, res);
  }

  /* Refresh Controller
   * @desc: Refresh access token
   * @route: /auth/refresh
   * @param: AuthUser, Response
   * @returns: Promise<RefreshResponseDto>
   */
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate user access and refresh cookies' })
  @ApiOkResponse({ type: RefreshResponseDto })
  refresh(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RefreshResponseDto> {
    return this.authService.refresh(user, res);
  }

  /* Logout Controller
   * @desc: Logout a user
   * @route: /auth/logout
   * @param: AuthUser, Response
   * @returns: LogoutResponseDto
   */
  @UseGuards(JwtAccessGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and clear auth cookies' })
  @ApiOkResponse({ type: LogoutResponseDto })
  logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): LogoutResponseDto {
    return this.authService.logout(user, res);
  }

  /* Get Me Controller
   * @desc: Get current user info
   * @route: /auth/me
   * @param: AuthUser
   * @returns: AuthMeResponseDto
   */
  @UseGuards(JwtAccessGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user JWT payload' })
  @ApiOkResponse({ type: AuthMeResponseDto })
  getMe(@CurrentUser() user: AuthUser): AuthMeResponseDto {
    return user;
  }
}
