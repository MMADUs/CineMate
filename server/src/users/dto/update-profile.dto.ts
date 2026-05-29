import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @ApiPropertyOptional({ example: 'Jane Doe' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number format is invalid' })
  @ApiPropertyOptional({ example: '+628123456789' })
  phoneNum?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ example: 'newpassword123' })
  password?: string;
}
