// src/api/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../axios';
import { AxiosError } from 'axios';
import type { UserProfile } from '../../types/user';

export const useGetProfile = () => {
    return useQuery<UserProfile, AxiosError>({
        queryKey: ['profile'],
        queryFn: async () => {
            const response = await api.get<{ success: boolean, data: UserProfile }>('/users/profile');
            
            return response.data.data;
        }
    });
};