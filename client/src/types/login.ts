export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    userId: string;
    fullName: string;
    email: string;
    phoneNum: string;
    authProvider: string;
    avatarUrl: string;
    createdAt: string;
}