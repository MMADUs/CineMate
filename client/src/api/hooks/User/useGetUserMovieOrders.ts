import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface UserPayment {
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

export interface UserSeat {
    bookingId: string;
    seatId: number;
    studioId: number;
    rowLetter: string;
    seatNumber: number;
}

export interface UserShowtime {
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
}

export interface MovieOrderResponse {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    payment: UserPayment | null;
    showtime: UserShowtime;
    seats: UserSeat[];
}

export const useGetUserMovieOrders = (enabled: boolean = true) => {
    return useQuery<MovieOrderResponse[], Error>({
        queryKey: ['userMovieOrders'],
        queryFn: async () => {
            const response = await api.get<MovieOrderResponse[]>('/users/orders');
            return response.data;
        },
        enabled, 
        refetchOnWindowFocus: false,
    });
};