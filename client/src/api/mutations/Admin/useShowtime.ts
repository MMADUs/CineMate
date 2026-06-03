import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import type { AdminShowtimeResponse } from '../../hooks/Admin/useGetShowtimes';

export interface CreateShowtimePayload {
    movieId: number;
    studioId: number; 
    showDate: string;
    showTime: string;
    price: number;
}

// Hook untuk Membuat Showtime
export const useCreateAdminShowtime = () => {
    const queryClient = useQueryClient();

    return useMutation<AdminShowtimeResponse, Error, CreateShowtimePayload>({
        mutationFn: async (payload) => {
            const response = await api.post<AdminShowtimeResponse>('/admin/showtimes', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
        }
    });
};

// Hook untuk Mengupdate Showtime
export const useUpdateAdminShowtime = () => {
    const queryClient = useQueryClient();

    return useMutation<AdminShowtimeResponse, Error, { id: number; payload: CreateShowtimePayload }>({
        mutationFn: async ({ id, payload }) => {
            const response = await api.put<AdminShowtimeResponse>(`/admin/showtimes/${id}`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
        }
    });
};

// Hook untuk Menghapus Showtime
export const useDeleteAdminShowtime = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/showtimes/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminShowtimes'] });
        }
    });
};