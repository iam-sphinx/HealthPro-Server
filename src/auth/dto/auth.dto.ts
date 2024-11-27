import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AuthDto {
  @ApiProperty({
    description: 'The username of the user',
    minLength: 3,
    maxLength: 20,
    pattern: '^[a-zA-Z0-9]*$',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(20)
  @IsAlphanumeric()
  username: string;

  @ApiProperty({
    description: 'The password of the user',
    minLength: 6,
    maxLength: 20,
    writeOnly: true,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @Transform(({ value }) => value.trim())
  password: string;
}
