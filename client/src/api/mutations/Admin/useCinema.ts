import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';

interface CinemaPayload {
    cinemaName: string;
    location: string;
}

// Hook untuk CREATE Cinema
export const useCreateAdminCinema = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, CinemaPayload>({
        mutationFn: async (payload) => {
            await api.post('/admin/cinemas', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCinemas'] });
        },
    });
};

// Hook untuk UPDATE Cinema
export const useUpdateAdminCinema = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: number; payload: CinemaPayload }>({
        mutationFn: async ({ id, payload }) => {
            await api.put(`/admin/cinemas/${id}`, payload); 
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCinemas'] });
        },
    });
};

// Hook untuk DELETE Cinema
export const useDeleteAdminCinema = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id) => {
            await api.delete(`/admin/cinemas/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminCinemas'] });
        },
    });
};