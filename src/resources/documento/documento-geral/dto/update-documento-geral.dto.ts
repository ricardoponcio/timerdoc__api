import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional, MaxLength } from "class-validator";
import { PeriodicidadeEnum } from "../entities/documento-geral.entity";

export class UpdateDocumentoGeralDto {

    @IsOptional()
    @MaxLength(255)
    @ApiProperty({ description: 'Nome reduzido do documento', maxLength: 255, type: String })
    nome: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição completa da função do documento', type: String })
    descricao: string;

    @IsNumber() @IsOptional()
    @ApiProperty({ description: 'Numero padrão que o documento ira ocorrer, padrão `1`, vai acontecer apenas uma vez. `0` para casos que ira acontecer sem termino', type: Number, default: 1 })
    recorrencia: number;

    @IsEnum(PeriodicidadeEnum) @IsOptional()
    @ApiProperty({ description: 'Valor responsável por identificar a periodicidade das entregas do documento', enum: PeriodicidadeEnum })
    periodicidade: PeriodicidadeEnum;

    @IsDateString() @IsOptional()
    @ApiPropertyOptional({ description: 'Data de início da recorrência para documentos recorrentes ou data de entrega para documentos não recorrentes', type: Date, format: 'date' })
    inicioContagem: Date;

    @IsDateString() @IsOptional()
    @ApiPropertyOptional({ description: 'Data do fim da recorrência para documentos recorrentes', type: Date, format: 'date' })
    fimContagem: Date;

    @IsOptional() @IsNumber()
    @ApiProperty({ description: 'Valor padrão a ser considerado em cada ocorrencia do documento', type: Number, default: 0 })
    valorPadrao: number;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Número de dias antes da data prevista que deverá ser alertado sobre a entrega do documento', type: Number })
    diasAvisoVencimento: number;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Identificador do usuário responsável pelo documento e entregas', type: Number })
    responsavelId: number;
}
