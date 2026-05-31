// src/api/hooks/useGetUserMovieOrders.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface MovieOrderResponse {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    // INI YANG KITA PERBAIKI SESUAI JSON BACKEND
    seats?: { 
        seatId: number; 
    }[]; 
    payment: {
        invoiceUrl: string;
        paymentStatus: string;
        paymentMethod: string;
    };
    showtime: {
        showtimeId: number;
        movieId: number; 
        hallId: number;  
        showDate: string;
        showTime: string;
        price: string;
        movie: {
            movieId: number; 
            title: string;
            imageUrl: string;
        };
    };
}

export const useGetUserMovieOrders = () => {
    return useQuery<MovieOrderResponse[], Error>({
        queryKey: ['userMovieOrders'],
        queryFn: async () => {
            const response = await api.get<MovieOrderResponse[]>('/users/orders');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};