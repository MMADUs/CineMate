export interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    phoneNum: string;
    authProvider: string;
    avatarUrl: string;
    createdAt: string;
}

export interface UpdateProfilePayload {
    fullName: string;
    phoneNum: string;
    password?: string; 
}