export interface AuthUser {
  userId: string;
  email: string;
  refreshToken?: string;
}

export interface AuthAdmin {
  adminId: number;
  email: string;
  refreshToken?: string;
}
