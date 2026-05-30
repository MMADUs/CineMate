import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios';
import { AxiosError } from 'axios';
import type { LoginResponse } from '../../../types/login';

export const useGoogleAuth = () => {
    return useMutation<LoginResponse, AxiosError<{ message: string }>, { idToken: string }>({
        mutationFn: async (payload) => {
            const response = await api.post<{ success: boolean, data: LoginResponse }>('/auth/google', payload);
            return response.data.data;
        }
    });
};