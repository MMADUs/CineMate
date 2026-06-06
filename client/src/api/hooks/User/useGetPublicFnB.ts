import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface FnbItem {
    snackId: number;
    snackName: string;
    category: string;
    price: string; 
    stock: number;
    imageKey: string;
    imageUrl: string;
}

export const useGetPublicFnB = (category: string | null) => {
    return useQuery<FnbItem[], Error>({
        queryKey: ['publicFnB', category],
        queryFn: async () => {
            const params = category ? { category } : {};
            const response = await api.get<FnbItem[]>('/snacks', { params });
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};