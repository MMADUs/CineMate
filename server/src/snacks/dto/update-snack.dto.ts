import { PartialType } from '@nestjs/mapped-types';
import { CreateSnackDto } from './create-snack.dto';

export class UpdateSnackDto extends PartialType(CreateSnackDto) {}
