export class FnbOrderItemResponseDto {
  snackId: number;
  quantity: number;
  subTotalPrice: string;
}

export class FnbOrderResponseDto {
  fnbOrderId: string;
  userId: number;
  orderDate: string;
  taxAmount: string;
  totalAmount: string;
  orderStatus: string;
  items: FnbOrderItemResponseDto[];
}
