import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'jane@example.com' })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'password123' })
  password: string;
}
