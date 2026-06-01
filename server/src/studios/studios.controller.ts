import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { CreateStudioDto } from './dto/create-studio.dto';
import { StudioResponseDto } from './dto/studio-response.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { StudiosService } from './studios.service';

@UseGuards(AdminJwtGuard)
@ApiTags('Studios')
@Controller('admin/studios')
export class StudiosController {
  constructor(private readonly studiosService: StudiosService) {}

  /* Find All Studios Controller
   * @desc: List all studios
   * @route: /admin/studios
   * @returns: Promise<StudioResponseDto[]>
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List studios' })
  @ApiOkResponse({ type: [StudioResponseDto] })
  findAll(): Promise<StudioResponseDto[]> {
    return this.studiosService.findAll();
  }

  /* Create Studio Controller
   * @desc: Create a studio and generate seats
   * @route: /admin/studios
   * @param: CreateStudioDto
   * @returns: Promise<StudioResponseDto>
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create studio and generate seats' })
  @ApiCreatedResponse({ type: StudioResponseDto })
  create(@Body() dto: CreateStudioDto): Promise<StudioResponseDto> {
    return this.studiosService.create(dto);
  }

  /* Update Studio Controller
   * @desc: Update a studio
   * @route: /admin/studios/:studioId
   * @param: studioId, UpdateStudioDto
   * @returns: Promise<StudioResponseDto>
   */
  @Put(':studioId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update studio' })
  @ApiOkResponse({ type: StudioResponseDto })
  update(
    @Param('studioId', ParseIntPipe) studioId: number,
    @Body() dto: UpdateStudioDto,
  ): Promise<StudioResponseDto> {
    return this.studiosService.update(studioId, dto);
  }

  /* Remove Studio Controller
   * @desc: Delete a studio
   * @route: /admin/studios/:studioId
   * @param: studioId
   * @returns: Promise<StudioResponseDto>
   */
  @Delete(':studioId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete studio' })
  @ApiOkResponse({ type: StudioResponseDto })
  remove(
    @Param('studioId', ParseIntPipe) studioId: number,
  ): Promise<StudioResponseDto> {
    return this.studiosService.remove(studioId);
  }
}
