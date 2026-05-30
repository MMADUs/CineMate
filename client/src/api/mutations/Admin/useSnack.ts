import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import type { AdminSnackResponse } from '../../hooks/Admin/useGetAdminSnacks';

export const useUploadSnackImage = () => {
    return useMutation<unknown, Error, File>({
        mutationFn: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'snacks'); 

            const response = await api.post('/admin/uploads/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return response.data.data || response.data;
        }
    });
};

export interface CreateSnackPayload {
    snackName: string;
    category: string;
    price: number;
    stock: number;
    imageKey: string;
}

export const useCreateAdminSnack = () => {
    const queryClient = useQueryClient();

    return useMutation<AdminSnackResponse, Error, CreateSnackPayload>({
        mutationFn: async (payload) => {
            const response = await api.post<AdminSnackResponse>('/admin/snacks', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSnacks'] });
        }
    });
};

// Hook untuk Mengupdate Snack
export const useUpdateAdminSnack = () => {
    const queryClient = useQueryClient();

    return useMutation<AdminSnackResponse, Error, { id: number; payload: CreateSnackPayload }>({
        mutationFn: async ({ id, payload }) => {
            const response = await api.put<AdminSnackResponse>(`/admin/snacks/${id}`, payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSnacks'] });
        }
    });
};

// Hook untuk Menghapus Snack dari Database
export const useDeleteAdminSnack = () => {
    const queryClient = useQueryClient();

    return useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/snacks/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminSnacks'] });
        }
    });
};

// Hook untuk Menghapus Gambar dari RustFS (agar tidak nyampah di server)
export const useDeleteSnackImage = () => {
    return useMutation<unknown, Error, string>({
        mutationFn: async (imageKey) => {
            const parts = imageKey.split('/'); 
            if (parts.length === 2) {
                const folder = parts[0];
                const filename = parts[1];
                const response = await api.delete(`/admin/uploads/images/${folder}/${filename}`);
                return response.data;
            }
            throw new Error("Format imageKey tidak valid");
        }
    });
};