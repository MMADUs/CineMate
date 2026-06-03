import { useMutation } from '@tanstack/react-query';
import { api } from '../axios';

export interface CheckoutPayload {
    showtimeId: number;
    seatIds: number[];
}

export interface CheckoutResponse {
    invoiceUrl?: string;
    booking?: {
        bookingId: string;
        payment?: {
            invoiceUrl: string;
        };
    };
    payment?: {
        invoiceUrl: string;
    };
    data?: {
        invoiceUrl?: string;
        booking?: {
            payment?: {
                invoiceUrl: string;
            };
        };
        payment?: {
            invoiceUrl: string;
        };
    };
}

export const useCheckoutBooking = () => {
    return useMutation<CheckoutResponse, Error, CheckoutPayload>({
        mutationFn: async (payload) => {
            const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);

            const response = await api.post<CheckoutResponse>('/bookings/checkout', payload, {
                headers: {
                    'Idempotency-Key': idempotencyKey
                }
            });
            return response.data;
        }
    });
};