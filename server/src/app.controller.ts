import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* Healthcheck Controller
   * @desc: Check whether the API is running
   * @route: /health
   * @param: none
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Healthcheck' })
  @ApiOkResponse({ type: HealthResponseDto })
  healthcheck(): HealthResponseDto {
    return this.appService.healthcheck();
  }
}
