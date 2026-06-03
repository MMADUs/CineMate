import { useMutation } from '@tanstack/react-query';
import { api } from '../../axios';
import { AxiosError } from 'axios';

export const useLogout = () => {
    return useMutation<{ message: string }, AxiosError>({
        mutationFn: async () => {
            const response = await api.post('/auth/logout');
            return response.data;
        }
    });
};