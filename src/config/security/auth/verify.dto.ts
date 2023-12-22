import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyDto {
  @MaxLength(32) @IsString() @IsNotEmpty()
  @Expose() @ApiProperty({ description: 'Senha de acesso', type: String })
  senha: string;

  @MaxLength(32) @IsString() @IsNotEmpty()
  @Expose() @ApiProperty({ description: 'Confirme a senha de acesso', type: String })
  senhaConfirmacao: string;
}
