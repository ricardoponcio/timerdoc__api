import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { DocumentoRecorrente, SituacaoEntregaEnum } from "../entities/documento-recorrente.entity";

export class CreateDocumentoRecorrenteDto {

    @IsDateString()
    @ApiProperty({ description: 'Prazo de entrega', type: Date, format: 'date' })
    prazo: Date;

    @IsDateString() @IsOptional()
    @ApiProperty({ description: 'Data da entrega', type: Date, format: 'date' })
    entrega: Date;

    @IsDateString()
    @ApiProperty({ description: 'Competência da ocorrência', type: Date, format: 'date' })
    competenciaReferencia: Date;

    @IsEnum(SituacaoEntregaEnum)
    @ApiProperty({ description: 'Situação atual da ocorrência', enum: SituacaoEntregaEnum })
    situacao: SituacaoEntregaEnum;

    @IsOptional()
    @ApiPropertyOptional({ description: 'Detalhes específicos da entrega', type: String })
    descricao: string;

    @ApiHideProperty()
    usuarioUltimaAlteracaoId: number;

    @IsNumber() @IsOptional()
    @ApiPropertyOptional({ description: 'Identificador do usuário responsável pelo documento e entregas', type: Number })
    responsavelId: number;

    @IsOptional()
    toDocumentoRecorrente = () => {
        const docRecorrente: DocumentoRecorrente = new DocumentoRecorrente;

        docRecorrente.dataCriacao = new Date();
        docRecorrente.dataAtualizacao = new Date();
        docRecorrente.dataRemocao = undefined;
        docRecorrente.prazo = this.prazo;
        docRecorrente.competenciaReferencia = this.competenciaReferencia;
        docRecorrente.situacao = this.situacao;
        docRecorrente.entrega = this.entrega;
        docRecorrente.descricao = this.descricao;
        docRecorrente.usuarioUltimaAlteracaoId = undefined;
        docRecorrente.responsavelId = this.responsavelId;

        return docRecorrente;
    }
}
