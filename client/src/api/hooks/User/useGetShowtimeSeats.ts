import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface HallInfo {
    hallId: number;
    cinemaName: string;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

export interface Seat {
    seatId: number;
    hallId: number;
    rowLetter: string;
    seatNumber: number;
    isOccupied: boolean;
}

export interface ShowtimeSeatsResponse {
    hall: HallInfo;
    seats: Seat[];
}

export const useGetShowtimeSeats = (showtimeId?: string) => {
    return useQuery<ShowtimeSeatsResponse, Error>({
        queryKey: ['showtimeSeats', showtimeId],
        queryFn: async () => {
            const response = await api.get<ShowtimeSeatsResponse>(`/showtimes/${showtimeId}/seats`);
            return response.data;
        },
        enabled: !!showtimeId, // Hanya jalan jika showtimeId ada di URL
        refetchOnWindowFocus: false,
    });
};