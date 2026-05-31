import { useMutation } from '@tanstack/react-query';
import { api } from '../axios';

export interface FnBCheckoutItem {
    snackId: number;
    quantity: number;
}

export interface FnBCheckoutPayload {
    showtimeId?: number | null; 
    items: FnBCheckoutItem[];
}

export interface FnBCheckoutResponse {
    order?: {
        payment?: {
            invoiceUrl?: string;
        }
    };
    payment?: {
        invoiceUrl?: string;
    };
}

export const useCheckoutFnB = () => {
    return useMutation<FnBCheckoutResponse, Error, FnBCheckoutPayload>({
        mutationFn: async (payload) => {
            const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2) + Date.now().toString(36);

            const response = await api.post<FnBCheckoutResponse>('/fnb-orders/checkout', payload, {
                headers: {
                    'Idempotency-Key': idempotencyKey
                }
            });
            return response.data;
        }
    });
};