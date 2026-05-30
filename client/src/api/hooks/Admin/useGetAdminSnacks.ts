import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminSnackResponse {
    snackId: number;
    snackName: string;
    category: string;
    price: string; 
    stock: number;
    imageKey: string;
    imageUrl: string;
}

export const useGetAdminSnacks = () => {
    return useQuery<AdminSnackResponse[], Error>({
        queryKey: ['adminSnacks'],
        queryFn: async () => {
            const response = await api.get<AdminSnackResponse[]>('/admin/snacks');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};