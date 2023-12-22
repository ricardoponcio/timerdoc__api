import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  MaxLength
} from 'class-validator';

export class CheckEmailRecordDto {
  @MaxLength(255) @IsEmail() @IsNotEmpty()
  @Expose()
  @ApiProperty({ description: 'Email de acesso', type: String })
  email: string;
}
