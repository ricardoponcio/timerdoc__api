import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { NivelAtributoEnum } from "../entities/documento-formulario.entity";

export class CreateDocumentoFormularioDto {

    @IsEnum(NivelAtributoEnum)
    @ApiProperty({ description: 'Nível da aplicação do atributo', enum: NivelAtributoEnum })
    nivel: NivelAtributoEnum;

    @IsString()
    @ApiProperty({ description: 'Nome do Formulário', type: String })
    nome: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição do Formulário', type: String })
    descricao: string;

    @IsString()
    @ApiProperty({ description: 'Corpo Formatado do Formulário', type: String })
    corpo: string;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'ID do Documento Geral quando formulário de nível de Documento', type: Number })
    documentoGeralId: number;

}
