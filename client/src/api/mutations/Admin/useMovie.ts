import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import type { AdminMovie } from '../../hooks/Admin/useGetAdminMovies';

interface UploadResponse {
    imageKey: string;
    imageUrl: string;
}

export const useUploadImage = () => {
    return useMutation<UploadResponse, Error, File>({
        mutationFn: async (file) => {
            const formData = new FormData();
            
            formData.append('file', file); 
            
            formData.append('folder', 'movies'); 

            const response = await api.post('/admin/uploads/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return response.data.data || response.data;
        }
    });
};

export interface CreateMoviePayload {
    title: string;
    description: string;
    genre: string;
    ageRate: string;
    durationMinutes: number;
    imageKey: string;
    trailerUrl: string;
    releaseDate: string;
    endDate: string;
    status: string;
}


// ADD Movie
export const useCreateMovie = () => {
    const queryClient = useQueryClient();
    
    return useMutation<AdminMovie, Error, CreateMoviePayload>({
        mutationFn: async (payload) => {
            const response = await api.post<AdminMovie>('/admin/movies', payload);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
        }
    });
};

// Edit Movie
export const useUpdateMovie = () => {
    const queryClient = useQueryClient();
    
    return useMutation<AdminMovie, Error, { id: number; payload: CreateMoviePayload }>({
        mutationFn: async ({ id, payload }) => {
            const response = await api.put<AdminMovie>(`/admin/movies/${id}`, payload);
            return response.data;
        },
        onSuccess: () => {
            // Refresh tabel otomatis
            queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
        }
    });
};

export const useDeleteImage = () => {
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

// Delete Movie
export const useDeleteMovie = () => {
    const queryClient = useQueryClient();
    
    return useMutation<unknown, Error, number>({
        mutationFn: async (id) => {
            const response = await api.delete(`/admin/movies/${id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminMovies'] });
        }
    });
};