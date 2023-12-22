import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, MaxLength } from "class-validator";
import { DocumentoGeral, PeriodicidadeEnum } from "../entities/documento-geral.entity";

export class CreateDocumentoGeralDto {
    @MaxLength(255) @IsNotEmpty()
    @ApiProperty({ description: 'Nome reduzido do documento', maxLength: 255, type: String })
    nome: string;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Descrição completa da função do documento', type: String })
    descricao: string;

    @IsNumber() @IsOptional()
    @ApiProperty({ description: 'Numero padrão que o documento ira ocorrer, padrão `1`, vai acontecer apenas uma vez. `0` para casos que ira acontecer sem termino', type: Number, default: 1 })
    recorrencia: number;

    @IsEnum(PeriodicidadeEnum)
    @ApiProperty({ description: 'Valor responsável por identificar a periodicidade das entregas do documento', enum: PeriodicidadeEnum })
    periodicidade: PeriodicidadeEnum;

    @IsDateString()
    @ApiProperty({ description: 'Data do início da contagem das entregas, deverá ser feita a primeira nesta data e subsequentemente na periodicidade informada', type: Date, format: 'date' })
    inicioContagem: Date;

    @IsDateString() @IsOptional()
    @ApiPropertyOptional({ description: 'Data do fim da recorrência para documentos recorrentes', type: Date, format: 'date' })
    fimContagem: Date;

    @IsNumber()
    @ApiProperty({ description: 'Valor padrão a ser considerado em cada ocorrencia do documento', type: Number, default: 0 })
    valorPadrao: number;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Número de dias antes da data prevista que deverá ser alertado sobre a entrega do documento', type: Number })
    diasAvisoVencimento: number;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Identificador do usuário responsável pelo documento e entregas', type: Number })
    responsavelId: number;

    @IsOptional()
    toDocumentoGeral = () => {
        const docGeral: DocumentoGeral = new DocumentoGeral;

        docGeral.nome = this.nome;
        docGeral.descricao = this.descricao;
        docGeral.dataRemocao = undefined;
        docGeral.recorrencia = this.recorrencia;
        docGeral.periodicidade = this.periodicidade;
        docGeral.inicioContagem = this.inicioContagem;
        docGeral.fimContagem = this.fimContagem;
        docGeral.valorPadrao = this.valorPadrao;
        docGeral.diasAvisoVencimento = this.diasAvisoVencimento;
        docGeral.responsavelId = this.responsavelId;

        return docGeral
    }
}
