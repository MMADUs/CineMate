import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminStudioResponse {
    studioId: number;
    cinemaId: number;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

export const useGetAdminStudios = () => {
    return useQuery<AdminStudioResponse[], Error>({
        queryKey: ['adminStudios'],
        queryFn: async () => {
            const response = await api.get<AdminStudioResponse[]>('/admin/studios');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};