import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class ReadUsuarioIdWithoutCompanyDto {

    @Expose() @ApiProperty({ description: 'Identificação do usuário ', type: Number })
    id: number;

    @Expose() @ApiProperty({ description: 'Nome do Usuário', type: String })
    nome: string;

    @Expose() @ApiProperty({ description: 'Email de cadastro', type: String })
    email: string

    @Expose() @ApiProperty({ description: 'Telefone de contato', type: String })
    telefone: string;

    @Expose() @ApiProperty({ description: 'Idioma Preferido', type: String })
    idiomaPreferido: string;

}
