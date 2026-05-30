// src/api/mutations/useUpdateProfile.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../axios';
import { AxiosError } from 'axios';
import type { UserProfile, UpdateProfilePayload } from '../../types/user';

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    return useMutation<UserProfile, AxiosError<{ message: string }>, UpdateProfilePayload>({
        mutationFn: async (payload) => {
            const dataToSend = { ...payload };
            if (!dataToSend.password) {
                delete dataToSend.password;
            }
            
            const response = await api.put<{ success: boolean, data: UserProfile }>('/users/profile', dataToSend);
            
            return response.data.data; 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
        }
    });
};