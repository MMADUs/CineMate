// src/api/hooks/useGetAdminTransactions.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface AdminPayment {
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

export interface AdminShowtime {
    showtimeId: number;
    movieId: number;
    hallId: number;
    showDate: string;
    showTime: string;
    price: string;
    movie: {
        movieId: number;
        title: string;
        description: string;
        genre: string;
        ageRate: string;
        durationMinutes: number;
        imageKey: string;
        imageUrl: string;
        trailerUrl: string;
        releaseDate: string;
        endDate: string;
        status: string;
    }
}

export interface AdminBooking {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    payment: AdminPayment | null;
    showtime: AdminShowtime;
}

export interface AdminFnBItem {
    snackId: number;
    quantity: number;
    subTotalPrice: string;
}

export interface AdminFnBOrder {
    fnbOrderId: string;
    userId: string;
    showtimeId: number | null;
    orderDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    items: AdminFnBItem[];
    payment: AdminPayment | null;
}

export interface AdminTransactionsResponse {
    bookings: AdminBooking[];
    fnbOrders: AdminFnBOrder[];
    payments: AdminPayment[];
}

export const useGetAdminTransactions = () => {
    return useQuery<AdminTransactionsResponse, Error>({
        queryKey: ['adminTransactions'],
        queryFn: async () => {
            const response = await api.get<AdminTransactionsResponse>('/admin/transactions');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};