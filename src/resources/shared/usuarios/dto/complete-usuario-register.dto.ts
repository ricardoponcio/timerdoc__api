import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class CompleteUsuarioRegisterDto {

    @MaxLength(150) @IsNotEmpty()
    @ApiProperty({ description: 'Nome do Usuário a ser registrado', type: String })
    nome: string;

    @MaxLength(255) @IsEmail() @IsNotEmpty()
    @ApiProperty({ description: 'Email do cadastro, deve ser igual ao do convite', type: String })
    email: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Telefone para contato', type: String })
    telefone: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Idioma Preferido', type: String })
    idiomaPreferido: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Senha de acesso à plataforma', type: String })
    senha: string;

    @IsNotEmpty()
    @ApiProperty({ description: 'Confirmação da senha, deve ser igual a senha anterior', type: String })
    senhaConfirmacao: string;

}
