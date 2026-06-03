import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios'; 
import { AxiosError } from 'axios';
import type { RegisterPayload, RegisterResponse } from '../../../types/register'; 

// Fungsi inti Axios untuk menembak API
const registerUser = async (payload: RegisterPayload): Promise<RegisterResponse> => {
    // URL '/auth/register' akan otomatis digabung dengan VITE_API_BASE_URL
    const response = await api.post<RegisterResponse>('/auth/register', payload);
    return response.data;
};

// Custom Hook TanStack Query
export const useRegister = () => {
    return useMutation<RegisterResponse, AxiosError<{ message: string }>, RegisterPayload>({
        mutationFn: registerUser,
        onSuccess: (data) => {
            console.log('Registration successful! User created:', data);
        },
        onError: (error) => {
            console.error('Registration failed:', error.response?.data?.message || error.message);
        }
    });
};