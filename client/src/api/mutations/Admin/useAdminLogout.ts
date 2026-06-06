import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../axios';
import { AxiosError } from 'axios';

export const useAdminLogout = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, AxiosError>({
        mutationFn: async () => {
            await api.post('/admin/auth/logout');
        },
        onSuccess: () => {
            queryClient.clear();
        }
    });
};