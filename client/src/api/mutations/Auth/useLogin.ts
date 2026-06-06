import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios'; 
import { AxiosError } from 'axios';
import type { LoginPayload, LoginResponse } from '../../../types/login';

interface LoginVariables {
    payload: LoginPayload;
    isAdmin?: boolean;
}

export const useLogin = () => {
    return useMutation<LoginResponse, AxiosError<{ message: string }>, LoginVariables>({
        mutationFn: async ({ payload, isAdmin }) => {
            const endpoint = isAdmin ? '/admin/auth/login' : '/auth/login';
            const response = await api.post<{ success: boolean, data: LoginResponse }>(endpoint, payload);
            return response.data.data;
        },
        onSuccess: (data) => {
            console.log('Login successful! User data:', data);
        },
        onError: (error) => {
            console.error('Login failed:', error.response?.data?.message || error.message);
        }
    });
};