export class AuthUserResponseDto {
  userId: number;
  fullName: string;
  email: string;
  phoneNum: string;
  createdAt: string;
}

export class AuthMeResponseDto {
  userId: number;
  email: string;
}

export class RefreshResponseDto {
  user: AuthUserResponseDto;
}

export class LogoutResponseDto {
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
