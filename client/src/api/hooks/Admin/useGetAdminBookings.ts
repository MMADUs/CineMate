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

export interface AdminSeat {
    bookingId: string;
    seatId: number;
    studioId: number;
    rowLetter: string;
    seatNumber: number;
}

export interface AdminShowtime {
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

export interface AdminBookingUser {
    userId: string;
    fullName: string;
    email: string;
    phoneNum: string;
    authProvider: string;
    avatarUrl: string;
    createdAt: string;
}

export interface AdminBookingResponse {
    bookingId: string;
    userId: string;
    showtimeId: number;
    bookingDate: string;
    taxAmount: string;
    totalAmount: string;
    orderStatus: string;
    payment: AdminPayment | null;
    showtime: AdminShowtime;
    seats: AdminSeat[];
    user: AdminBookingUser; 
}

export const useGetAdminBookings = () => {
    return useQuery<AdminBookingResponse[], Error>({
        queryKey: ['adminBookings'],
        queryFn: async () => {
            const response = await api.get<AdminBookingResponse[]>('/admin/bookings');
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
};