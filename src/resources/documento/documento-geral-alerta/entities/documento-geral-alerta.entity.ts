import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import * as _ from "lodash";
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { DocumentoGeral } from "../../documento-geral/entities/documento-geral.entity";
import { DocumentoGeralAlertaCompetencia } from "./documento-geral-alerta-competencia.entity";

export enum AlertaTipoEnum {  // com base na migration
    DocumentoFaltante = 'F',
    EntregaPendente = 'P',
    EntregaAindaAberta = 'C',
    ProximoDaEntrega = 'A'
}
export const tipoTypes: string[] =
    _.values(AlertaTipoEnum);

export enum AlertaPrioridadeEnum {  // com base na migration
    INFO = 'INFO',
    WARN = 'WARN',
    ERRO = 'ERRO'
}
export const prioridadeTypes: string[] =
    _.values(AlertaPrioridadeEnum);

@Table({ tableName: 'documento_geral_alerta', paranoid: false, timestamps: false })
export class DocumentoGeralAlerta extends Model<DocumentoGeralAlerta> {

    @ApiProperty() @Expose()
    id?: number;

    @Column
    @ApiProperty() @Expose()
    dataHora: Date;

    @Column
    @ApiProperty() @Expose()
    mensagem: string;

    @Column
    @ApiProperty() @Expose()
    descricao: string;

    @Column({ type: DataType.ENUM({ values: tipoTypes }), validate: { isIn: [tipoTypes] } })
    @ApiProperty({ enum: AlertaTipoEnum }) @Expose()
    tipo: AlertaTipoEnum;

    @Column({ type: DataType.ENUM({ values: prioridadeTypes }), validate: { isIn: [prioridadeTypes] } })
    @ApiProperty({ enum: AlertaPrioridadeEnum }) @Expose()
    prioridade: AlertaPrioridadeEnum;

    @Column({ field: 'prioridade_ordem' })
    @ApiProperty() @Expose()
    prioridadeOrdem: number;

    @Column
    @ApiProperty() @Expose()
    resolucao: boolean;

    @Column({ field: 'documento_geral_id' }) @ForeignKey(() => DocumentoGeral)
    @Exclude()
    documentoGeralId: number;

    @BelongsTo(() => DocumentoGeral) @ApiProperty({ type: DocumentoGeral })
    @Expose() @Type(() => DocumentoGeral)
    documentoGeral: DocumentoGeral;

    @Column({ field: 'substituicao_alerta_id' }) @ForeignKey(() => DocumentoGeralAlerta)
    @Exclude()
    substituicaoAlertaId: number;

    @BelongsTo(() => DocumentoGeralAlerta) @ApiProperty({ type: DocumentoGeralAlerta })
    @Expose() @Type(() => DocumentoGeralAlerta)
    substituicaoAlerta: DocumentoGeralAlerta;

    @Expose()
    @HasMany(() => DocumentoGeralAlertaCompetencia, 'documento_geral_alerta_id')
    competencias: DocumentoGeralAlertaCompetencia[];

}
