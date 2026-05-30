import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminProfileResponse {
    adminId: number;
    username: string;
    email: string;
}

export const useGetAdminProfile = () => {
    return useQuery<AdminProfileResponse, Error>({
        queryKey: ['adminProfile'],
        queryFn: async () => {
            const response = await api.get<AdminProfileResponse>('/admin/profile');
            return response.data;
        },
        refetchOnWindowFocus: false,
        retry: 1, 
    });
};