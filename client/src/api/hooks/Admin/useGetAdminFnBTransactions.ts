import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';
import { type AdminBookingResponse } from './useGetAdminBookings';

export interface AdminFnBOrderItem {
    snackId: number;
    quantity: number;
    subTotalPrice: string;
}

export interface AdminFnBOrderUser {
    userId: string;
    fullName: string;
    email: string;
    phoneNum: string;
    authProvider: string;
    avatarUrl: string;
    createdAt: string;
}

export interface AdminFnBOrderPayment {
    paymentId: number;
    bookingId: string | null;
    fnbOrderId: string | null;
    provider: string;
    providerPaymentId: string;
    externalId: string;
    invoiceUrl: string;
    paymentMethod: string;
    amount: string;
    currency: string;
    paymentDate: string;
    paymentStatus: string;
    paidAt: string | null;
    expiresAt: string | null;
    failureReason: string | null;
}

export interface AdminFnBOrderResponse {
    fnbOrderId: string;
    userId: string;
    bookingId: string | null;
    orderDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    items: AdminFnBOrderItem[];
    payment: AdminFnBOrderPayment | null;
    booking: AdminBookingResponse | null; 
    user: AdminFnBOrderUser;
}

export const useGetAdminFnBOrders = () => {
    return useQuery<AdminFnBOrderResponse[], Error>({
        queryKey: ['adminFnBOrders'],
        queryFn: async () => {
            const response = await api.get<AdminFnBOrderResponse[]>('/admin/fnb-orders');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};