export class HallResponseDto {
  hallId: number;
  cinemaName: string;
  studioName: string;
  totalRows: number;
  seatsPerRow: number;
}

export interface GeneratedSeatValue {
  hallId: number;
  rowLetter: string;
  seatNumber: number;
}
