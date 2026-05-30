import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import type { CinemaHallResponse } from '../../hooks/Admin/useGetHalls'; 

export interface CreateHallPayload {
    cinemaName: string;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

// Hook untuk Membuat Studio
export const useCreateAdminHall = () => {
    const queryClient = useQueryClient();

    return useMutation<CinemaHallResponse, Error, CreateHallPayload>({
        mutationFn: async (payload) => {
            const response = await api.post<CinemaHallResponse>('/admin/halls', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
        }
    });
};

// Hook untuk Mengupdate Studio
export const useUpdateAdminHall = () => {
    const queryClient = useQueryClient();

    return useMutation<CinemaHallResponse, Error, { id: number; payload: CreateHallPayload }>({
        mutationFn: async ({ id, payload }) => {
            const response = await api.put<CinemaHallResponse>(`/admin/halls/${id}`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
        }
    });
};

// Hook untuk Menghapus Studio
export const useDeleteAdminHall = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/halls/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminHalls'] });
        }
    });
};