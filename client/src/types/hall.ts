export interface CinemaHall {
    HallID: string;
    CinemaName: string;
    StudioName: string;
    TotalRows: number;
    SeatsPerRow: number;
    Capacity: number;
}

export interface Seat {
    SeatID: string;
    HallID: string;
    RowLetter: string;
    SeatNumber: number;
}