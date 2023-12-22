import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUsuarioDto {

    @IsOptional()
    @ApiPropertyOptional()
    @MaxLength(150)
    @ApiProperty({ description: 'Novo nome para o usuário', type: String })
    nome: string;

    @IsOptional()
    @ApiPropertyOptional()
    @MaxLength(255) @IsEmail()
    @ApiProperty({ description: 'Novo email para o usuário', type: String })
    email: string

    @MinLength(8) @MaxLength(32) @IsString() @IsOptional()
    @ApiPropertyOptional()
    @ApiProperty({ description: 'Senha de acesso', type: String })
    senha: string;

    @MinLength(8) @MaxLength(32) @IsString() @IsOptional()
    @ApiPropertyOptional()
    @ApiProperty({ description: 'Confirme a senha de acesso', type: String })
    senhaConfirmacao: string;

    @IsOptional()
    @ApiPropertyOptional()
    @ApiProperty({ description: 'Novo telefone para o cadastro', type: String })
    telefone: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Idioma Preferido', type: String })
    idiomaPreferido: string;

}
