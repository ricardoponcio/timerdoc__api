import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { SituacaoEntregaEnum } from "../entities/documento-recorrente.entity";

export class UpdateDocumentoRecorrenteDto {

    @IsOptional()
    @IsDateString()
    @ApiProperty({ description: 'Prazo de entrega', type: Date, format: 'date' })
    prazo: Date;

    @IsDateString() @IsOptional()
    @ApiProperty({ description: 'Data da entrega', type: Date, format: 'date' })
    entrega: Date;

    @IsDateString() @IsOptional()
    @ApiProperty({ description: 'Competência da ocorrência', type: Date, format: 'date' })
    competenciaReferencia: Date;

    @IsEnum(SituacaoEntregaEnum) @IsOptional()
    @ApiProperty({ description: 'Situação atual da ocorrência', enum: SituacaoEntregaEnum })
    situacao: SituacaoEntregaEnum;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Detalhes específicos da entrega', type: String })
    descricao: string;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Identificador do usuário responsável pelo documento e entregas', type: Number })
    responsavelId: number;

}
