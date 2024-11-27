import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Validate,
} from 'class-validator';
import { IsAbsoluteUrl } from 'src/validators/isAbsoulteUrl';

export class CreateQRDto {
  @ApiProperty({
    description: 'The URL to be associated with the QR code',
    example: 'https://example.com',
  })
  @IsUrl()
  @IsNotEmpty()
  @Validate(IsAbsoluteUrl)
  url: string;

  @ApiProperty({
    description:
      'Optional metadata associated with the QR code (if provided, must be a valid JSON object)',
    example: '{"key": "value"}',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @Transform((value) => (typeof value === 'string' ? JSON.parse(value) : value)) // Converts metadata to object if it is a JSON string
  metadata?: object;
}

export class UpdateQRDto {
  @ApiProperty({
    description: 'The new URL to update the QR code with',
    example: 'https://new-url.com',
  })
  @IsUrl()
  @IsNotEmpty()
  @Validate(IsAbsoluteUrl)
  newUrl: string;
}

export class OptionalFilters {
  @ApiProperty({
    description: 'An optional date filter, can be a string',
    required: false,
    example: '2024-11-27',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim() || null)
  date?: string;

  @ApiProperty({
    description:
      'An optional range filter, which is an array of two date strings [startDate, endDate]',
    required: false,
    type: [String],
    example: ['2024-11-01', '2024-11-30'],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  range?: string[];
}

export class CreateEventDto {

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim() || null)
  location: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim() || null)
  device: string;

  @IsString()
  @IsOptional()
  @Length(1, 50)
  @Transform(({ value }) => value.trim().toLowerCase())
  platform?: string;
}
