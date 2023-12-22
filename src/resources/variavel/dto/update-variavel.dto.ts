import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class UpdateVariavelDto {

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Chave da Variável', type: String })
    chave: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Valor da Variável', type: String })
    valor: string;

    @IsString() @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição da Variável', type: String })
    descricao: string;

}
