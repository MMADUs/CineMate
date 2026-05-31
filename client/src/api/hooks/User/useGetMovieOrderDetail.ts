import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface MovieOrderDetailResponse {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    payment: {
        invoiceUrl: string;
        paymentStatus: string;
    };
    showtime: {
        hallId: number;
        showDate: string;
        showTime: string;
        price: string;
        movie: {
            title: string;
            imageUrl: string;
            ageRate: string;
            genre: string;
            durationMinutes: number;
        };
    };
    seats: {
        seatId: number;
    }[];
}

export const useGetMovieOrderDetail = (bookingId: string | undefined) => {
    return useQuery<MovieOrderDetailResponse, Error>({
        queryKey: ['movieOrderDetail', bookingId],
        queryFn: async () => {
            const response = await api.get<MovieOrderDetailResponse>(`/users/orders/${bookingId}`);
            return response.data;
        },
        enabled: !!bookingId, // Hanya menembak API jika bookingId tidak kosong
        refetchOnWindowFocus: false,
    });
};