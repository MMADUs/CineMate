import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';

export interface CreateStudioPayload {
    cinemaId: number;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

export const useCreateAdminStudio = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, CreateStudioPayload>({
        mutationFn: async (payload) => {
            await api.post('/admin/studios', payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
        }
    });
};

export const useUpdateAdminStudio = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: number; payload: CreateStudioPayload }>({
        mutationFn: async ({ id, payload }) => {
            // Gunakan PUT seperti di Cinemas sebelumnya
            await api.put(`/admin/studios/${id}`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
        }
    });
};

export const useDeleteAdminStudio = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id) => {
            await api.delete(`/admin/studios/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminStudios'] });
        }
    });
};