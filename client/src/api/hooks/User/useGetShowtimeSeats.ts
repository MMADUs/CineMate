import { useQuery } from '@tanstack/react-query';
import { api } from '../../axios';

export interface StudioInfo {
    studioId: number;
    cinemaId: number;
    studioName: string;
    totalRows: number;
    seatsPerRow: number;
}

export interface Seat {
    seatId: number;
    studioId: number;
    rowLetter: string;
    seatNumber: number;
    isOccupied: boolean;
}

export interface ShowtimeSeatsResponse {
    studio: StudioInfo; 
    seats: Seat[];
}

export const useGetShowtimeSeats = (showtimeId?: string) => {
    return useQuery<ShowtimeSeatsResponse, Error>({
        queryKey: ['showtimeSeats', showtimeId],
        queryFn: async () => {
            const response = await api.get<ShowtimeSeatsResponse>(`/showtimes/${showtimeId}/seats`);
            return response.data;
        },
        enabled: !!showtimeId,
        refetchOnWindowFocus: false,
    });
};