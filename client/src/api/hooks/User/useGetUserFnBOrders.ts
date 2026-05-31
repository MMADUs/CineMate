import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface FnBOrderResponse {
    fnbOrderId: string;
    userId: string;
    showtimeId: number | null;
    orderDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    items: {
        snackId: number;
        quantity: number;
        subTotalPrice: string;
    }[];
    payment: {
        invoiceUrl: string;
        paymentStatus: string;
        paymentMethod: string;
    };
}

export const useGetUserFnBOrders = () => {
    return useQuery<FnBOrderResponse[], Error>({
        queryKey: ['userFnBOrders'],
        queryFn: async () => {
            const response = await api.get<FnBOrderResponse[]>('/fnb-orders');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};