export type TransactionStatus = 'Pending' | 'Success' | 'Failed' | 'Cancelled';

export interface BookingPayload {
    BookingID: string;
    UserID: string;
    ShowtimeID: string;
    BookingDate: string;
    TotalAmount: number;
    TaxAmount: number;
    BookingStatus: TransactionStatus;
}

export interface BookingSeat {
    BookingSeatID: string;
    BookingID: string;
    SeatID: string;
}

export interface FNBOrderPayload {
    FNBOrderID: string;
    UserID: string;
    OrderDate: string;
    TotalAmount: number;
    TaxAmount: number;
    OrderStatus: TransactionStatus;
}

export interface FNBOrderItem {
    FNBOrderItemID: string;
    FNBOrderID: string;
    SnackID: string;
    Quantity: number;
    SubTotalPrice: number;
}

export interface Payment {
    PaymentID: string;
    BookingID?: string;   
    FNBOrderID?: string; 
    PaymentMethod: string;
    Amount: number;
    PaymentDate: string;
    PaymentStatus: TransactionStatus;
}