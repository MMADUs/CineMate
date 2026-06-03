import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface MovieOrderDetailSeat {
    bookingId: string;
    seatId: number;
    studioId: number;
    rowLetter: string;
    seatNumber: number;
}

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
    } | null;
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
    seats: MovieOrderDetailSeat[]; 
}

export const useGetMovieOrderDetail = (bookingId: string | undefined) => {
    return useQuery<MovieOrderDetailResponse, Error>({
        queryKey: ['movieOrderDetail', bookingId],
        queryFn: async () => {
            const response = await api.get<MovieOrderDetailResponse>(`/users/orders/${bookingId}`);
            return response.data;
        },
        enabled: !!bookingId, 
        refetchOnWindowFocus: false,
    });
};