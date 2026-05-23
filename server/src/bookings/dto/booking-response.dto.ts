export class BookingResponseDto {
  bookingId: string;
  userId: number;
  showtimeId: number;
  bookingDate: string;
  taxAmount: string;
  totalAmount: string;
  bookingStatus: string;
}

export class CreatedBookingResponseDto extends BookingResponseDto {
  seatIds: number[];
}

export class BookingSeatResponseDto {
  bookingId: string;
  seatId: number;
}

export class BookingDetailResponseDto extends BookingResponseDto {
  seats: BookingSeatResponseDto[];
}
