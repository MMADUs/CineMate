import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface FnBOrderDetailResponse {
    fnbOrderId: string;
    userId: string;
    bookingId: string | null;
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
    } | null;
    booking: {
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
        seats: {
            bookingId: string;
            seatId: number;
            studioId: number;
            rowLetter: string;
            seatNumber: number;
        }[];
    } | null;
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