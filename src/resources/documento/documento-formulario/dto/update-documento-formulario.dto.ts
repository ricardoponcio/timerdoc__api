import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateDocumentoFormularioDto {

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Nome do Formulário', type: String })
    nome: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição do Formulário', type: String })
    descricao: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Corpo Formatado do Formulário', type: String })
    corpo: string;

}
