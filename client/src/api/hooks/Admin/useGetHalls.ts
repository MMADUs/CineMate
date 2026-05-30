import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface CinemaHallResponse {
    hallId: number;
    cinemaName: string;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

export const useGetAdminHalls = () => {
    return useQuery<CinemaHallResponse[], Error>({
        queryKey: ['adminHalls'],
        queryFn: async () => {
            const response = await api.get<CinemaHallResponse[]>('/admin/halls');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};