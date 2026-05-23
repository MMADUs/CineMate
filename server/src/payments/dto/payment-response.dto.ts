export class PaymentResponseDto {
  paymentId: number;
  bookingId: string | null;
  fnbOrderId: string | null;
  paymentMethod: string;
  amount: string;
  paymentDate: string;
  paymentStatus: string;
}
