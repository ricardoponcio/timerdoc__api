import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Usuario } from "../../../resources/shared/usuarios/entities/usuario.entity";

export class RegisterDto {
    @MaxLength(255) @IsEmail() @IsNotEmpty()
    @Expose() @ApiProperty({ description: 'Email de acesso', type: String })
    email: string;

    @MaxLength(150) @IsString() @IsNotEmpty()
    @Expose() @ApiProperty({ description: 'Nome do usuário', type: String })
    nome: string;

    @IsString() @IsOptional()
    @Expose() @ApiProperty({ description: 'Telefone para contato', type: String })
    telefone: string;

    @IsString() @IsOptional()
    @Expose() @ApiPropertyOptional({ description: 'Idioma Preferido', type: String })
    idiomaPreferido: string;

    toUsuario(): Usuario {
        const user = new Usuario();
        user.nome = this.nome;
        user.email = this.email;
        user.idiomaPreferido = this.idiomaPreferido;
        user.ativo = true;
        return user;
    }
}