import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminMovie {
    movieId: number;
    title: string;
    description: string;
    genre: string;
    ageRate: string;
    durationMinutes: number;
    imageKey: string;
    imageUrl: string;
    trailerUrl: string;
    releaseDate: string;
    endDate: string;
    status: string;
}

export const useGetAdminMovies = () => {
    return useQuery<AdminMovie[], Error>({
        queryKey: ['adminMovies'],
        queryFn: async () => {
            const response = await api.get<AdminMovie[]>('/admin/movies');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};