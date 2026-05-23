export interface AuthUser {
  userId: number;
  email: string;
  refreshToken?: string;
}

export interface AuthAdmin {
  adminId: number;
  email: string;
  refreshToken?: string;
}
