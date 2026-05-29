import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovieResponseDto } from '../../movies/dto/movie-response.dto';
import { PaymentResponseDto } from '../../payments/dto/payment-response.dto';
import { ShowtimeResponseDto } from '../../showtimes/dto/showtime-response.dto';

export class BookingShowtimeResponseDto extends ShowtimeResponseDto {
  @ApiProperty({ type: MovieResponseDto })
  movie: MovieResponseDto;
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

  @ApiPropertyOptional({ type: PaymentResponseDto, nullable: true })
  payment?: PaymentResponseDto | null;

  @ApiPropertyOptional({ type: BookingShowtimeResponseDto })
  showtime?: BookingShowtimeResponseDto;
}

export class CreatedBookingResponseDto extends BookingResponseDto {
  @ApiProperty({ example: [1, 2] })
  seatIds: number[];
}

export class BookingSeatResponseDto {
  @ApiProperty({ example: 'booking-uuid' })
  bookingId: string;

  @ApiProperty({ example: 1 })
  seatId: number;
}

export class BookingDetailResponseDto extends BookingResponseDto {
  @ApiProperty({ type: [BookingSeatResponseDto] })
  seats: BookingSeatResponseDto[];
}
