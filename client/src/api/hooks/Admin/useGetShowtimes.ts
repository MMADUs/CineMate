import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminShowtimeResponse {
    showtimeId: number;
    movieId: number;
    hallId: number;
    showDate: string;
    showTime: string;
    price: string;
}

export const useGetAdminShowtimes = () => {
    return useQuery<AdminShowtimeResponse[], Error>({
        queryKey: ['adminShowtimes'],
        queryFn: async () => {
            const response = await api.get<AdminShowtimeResponse[]>('/admin/showtimes');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};