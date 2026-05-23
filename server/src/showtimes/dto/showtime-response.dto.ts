import { HallResponseDto } from '../../cinema-halls/dto/hall-response.dto';

export class ShowtimeResponseDto {
  showtimeId: number;
  movieId: number;
  hallId: number;
  showDate: string;
  showTime: string;
  price: string;
}

export class ShowtimeSeatResponseDto {
  seatId: number;
  hallId: number;
  rowLetter: string;
  seatNumber: number;
  isOccupied: boolean;
}

export class ShowtimeSeatsResponseDto {
  hall: HallResponseDto;
  seats: ShowtimeSeatResponseDto[];
}
