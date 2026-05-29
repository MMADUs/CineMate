import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @ApiPropertyOptional({ example: '+628123456789', nullable: true })
  phoneNum: string | null;

  @ApiProperty({ example: 'LOCAL', enum: ['LOCAL', 'GOOGLE'] })
  authProvider: string;

  @ApiPropertyOptional({
    example: 'https://lh3.googleusercontent.com/a/example',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({ example: '2026-05-23 10:00:00' })
  createdAt: string;
}
