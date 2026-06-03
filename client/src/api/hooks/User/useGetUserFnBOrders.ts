import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface FnBOrderPayment {
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

export interface FnBOrderItem {
    snackId: number;
    quantity: number;
    subTotalPrice: string;
}

export interface FnBOrderBooking {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    payment: FnBOrderPayment | null;
    showtime: {
        showtimeId: number;
        movieId: number;
        studioId: number;
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
        };
        studio: {
            studioId: number;
            cinemaId: number;
            studioName: string;
            totalRows: number;
            seatsPerRow: number;
            cinema: {
                cinemaId: number;
                cinemaName: string;
                location: string;
            };
        };
    };
    seats: {
        bookingId: string;
        seatId: number;
        studioId: number;
        rowLetter: string;
        seatNumber: number;
    }[];
}

export interface FnBOrderResponse {
    fnbOrderId: string;
    userId: string;
    bookingId: string | null; 
    orderDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    items: FnBOrderItem[];
    payment: FnBOrderPayment | null;
    booking: FnBOrderBooking | null; 
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