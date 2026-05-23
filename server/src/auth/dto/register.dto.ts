import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({ example: 'Jane Doe' })
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s]+$/, { message: 'Phone number format is invalid' })
  @ApiProperty({ example: '+628123456789' })
  phoneNum: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @ApiProperty({ example: 'password123' })
  password: string;
}
