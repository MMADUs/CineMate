import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CinemaResponseDto } from '../../cinemas/dto/cinema-response.dto';
import { MovieResponseDto } from '../../movies/dto/movie-response.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';
import { ShowtimeResponseDto } from '../../showtimes/dto/showtime-response.dto';
import { StudioResponseDto } from '../../studios/dto/studio-response.dto';
import { UserProfileResponseDto } from '../../users/dto/user-response.dto';

export class BookingStudioResponseDto extends StudioResponseDto {
  @ApiProperty({ type: CinemaResponseDto })
  cinema: CinemaResponseDto;
}

export class BookingShowtimeResponseDto extends ShowtimeResponseDto {
  @ApiProperty({ type: MovieResponseDto })
  movie: MovieResponseDto;

  @ApiProperty({ type: BookingStudioResponseDto })
  studio: BookingStudioResponseDto;
}

export class BookingSeatResponseDto {
  @ApiProperty({ example: 'booking-uuid' })
  bookingId: string;

  @ApiProperty({ example: 1 })
  seatId: number;

  @ApiProperty({ example: 1 })
  studioId: number;

  @ApiProperty({ example: 'A' })
  rowLetter: string;

  @ApiProperty({ example: 1 })
  seatNumber: number;
}

export class BookingResponseDto {
  @ApiProperty({ example: 'booking-uuid' })
  bookingId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 1 })
  showtimeId: number;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  bookingDate: string;

  @ApiProperty({ example: '11000' })
  taxAmount: string;

  @ApiProperty({ example: '111000' })
  totalAmount: string;

  @ApiProperty({ example: 'PendingPayment' })
  orderStatus: string;

  @ApiPropertyOptional({ type: PaymentResponseDto, nullable: true })
  payment?: PaymentResponseDto | null;

  @ApiPropertyOptional({ type: BookingShowtimeResponseDto })
  showtime?: BookingShowtimeResponseDto;

  @ApiPropertyOptional({ type: [BookingSeatResponseDto] })
  seats?: BookingSeatResponseDto[];
}

export class CreatedBookingResponseDto extends BookingResponseDto {
  @ApiProperty({ example: [1, 2] })
  seatIds: number[];
}

export class BookingDetailResponseDto extends BookingResponseDto {
  @ApiProperty({ type: [BookingSeatResponseDto] })
  declare seats: BookingSeatResponseDto[];
}

export class BookingCheckoutResponseDto {
  @ApiProperty({ type: BookingDetailResponseDto })
  booking: BookingDetailResponseDto;

  @ApiProperty({ type: PaymentResponseDto })
  payment: PaymentResponseDto;
}

export class AdminBookingResponseDto extends BookingDetailResponseDto {
  @ApiProperty({ type: UserProfileResponseDto })
  user: UserProfileResponseDto;
}
