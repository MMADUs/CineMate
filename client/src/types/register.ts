// Payload Request
export interface RegisterPayload {
    fullName: string;
    email: string;
    phoneNum: string;
    password: string;
}

// Tipe Response 
export interface RegisterResponse {
    userId: string;
    fullName: string;
    email: string;
    phoneNum: string;
    authProvider: string;
    avatarUrl: string;
    createdAt: string;
}