import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface CinemaResponse {
    cinemaId: number;
    cinemaName: string;
    location: string;
}

export const useGetAdminCinemas = () => {
    return useQuery<CinemaResponse[], Error>({
        queryKey: ['adminCinemas'],
        queryFn: async () => {
            const response = await api.get<CinemaResponse[]>('/admin/cinemas');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};