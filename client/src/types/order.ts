export type OrderStatus = 'Completed' | 'Cancelled' | 'Pending';

export interface OrderFnbItem {
    name: string;
    quantity: number;
}

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
    fnbItems?: OrderFnbItem[]; 
}

export interface OrderCardProps {
    order: OrderItem;
}