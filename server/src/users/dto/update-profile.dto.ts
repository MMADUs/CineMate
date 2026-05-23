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
  fullName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number format is invalid' })
  phoneNum?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}
