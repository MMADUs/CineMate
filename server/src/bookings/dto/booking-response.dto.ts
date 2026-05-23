import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty({ example: 'booking-uuid' })
  bookingId: string;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  showtimeId: number;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  bookingDate: string;

  @ApiProperty({ example: '11000' })
  taxAmount: string;

  @ApiProperty({ example: '111000' })
  totalAmount: string;

  @ApiProperty({ example: 'Pending' })
  bookingStatus: string;
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
