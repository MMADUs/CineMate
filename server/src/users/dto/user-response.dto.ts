import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiProperty({ example: '+628123456789' })
  phoneNum: string;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  createdAt: string;
}
