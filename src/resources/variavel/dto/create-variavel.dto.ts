import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { NivelAtributoEnum } from "../entities/variavel.entity";

export class CreateVariavelDto {

    @IsEnum(NivelAtributoEnum)
    @ApiProperty({ description: 'Nível da aplicação do atributo', enum: NivelAtributoEnum })
    nivel: NivelAtributoEnum;

    @IsString()
    @ApiProperty({ description: 'Chave da Variável', type: String })
    chave: string;

    @IsString()
    @ApiProperty({ description: 'Valor da Variável', type: String })
    valor: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição da Variável', type: String })
    descricao: string;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'ID do Documento Geral quando variável de nível de Documento', type: Number })
    documentoGeralId: number;

}
