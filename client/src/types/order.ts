export type OrderStatus = 'Completed' | 'Cancelled' | 'Pending' | 'Upcoming';

export interface OrderItem {
    id: string;
    movieId: string;
    movieTitle: string;
    posterUrl: string;
    date: string;
    time: string;
    seats: string;
    studio: string;
    price: number;
    status: OrderStatus;
}