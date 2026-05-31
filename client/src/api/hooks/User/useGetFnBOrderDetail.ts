import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface FnBOrderDetailResponse {
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
    };
}

export const useGetFnBOrderDetail = (fnbOrderId: string | undefined) => {
    return useQuery<FnBOrderDetailResponse, Error>({
        queryKey: ['fnbOrderDetail', fnbOrderId],
        queryFn: async () => {
            const response = await api.get<FnBOrderDetailResponse>(`/fnb-orders/${fnbOrderId}`);
            return response.data;
        },
        enabled: !!fnbOrderId, 
        refetchOnWindowFocus: false,
    });
};