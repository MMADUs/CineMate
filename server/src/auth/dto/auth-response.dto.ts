import { ApiProperty } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: '+628123456789' })
  phoneNum: string;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  createdAt: string;
}

export class AuthMeResponseDto {
  @ApiProperty({ example: 1 })
  userId: number;
  
  @ApiProperty({ example: 'jane@example.com' })
  email: string;
}

export class RefreshResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 'Logged out' })
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
