import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto';

@Injectable()
export class AppService {
  /* Healthcheck Service
   * @desc: Return API health status
   * @param: none
   * @returns: HealthResponseDto
   */
  healthcheck(): HealthResponseDto {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CineMate API',
    };
  }
}
