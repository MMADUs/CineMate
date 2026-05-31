import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface PublicShowtime {
    showtimeId: number;
    movieId: number;
    hallId: number;
    showDate: string;
    showTime: string;
    price: number;
}

export const useGetPublicShowtimes = (movieId?: string) => {
    return useQuery<PublicShowtime[], Error>({
        queryKey: ['publicShowtimes', movieId],
        queryFn: async () => {
            // Mengirim movieId sebagai query parameter: /api/showtimes?movieId=...
            const response = await api.get<PublicShowtime[]>('/showtimes', {
                params: { movieId }
            });
            return response.data;
        },
        enabled: !!movieId, // Hanya tembak API jika movieId tersedia
        refetchOnWindowFocus: false,
    });
};