import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '2026-05-23T10:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 'CineMate API' })
  service: string;
}
