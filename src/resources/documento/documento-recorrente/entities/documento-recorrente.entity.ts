import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import * as _ from "lodash";
import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, Table, UpdatedAt } from "sequelize-typescript";
import { ReadUsuarioDto } from "@app/resources/shared/usuarios/dto/read-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { DocumentoGeral } from "../../documento-geral/entities/documento-geral.entity";
import { DocumentoRecorrenteAnexo } from "../../documento-recorrente-anexo/entities/documento-recorrente-anexo.entity";
import { DocumentoRecorrenteObservacao } from "../../documento-recorrente-observacao/entities/documento-recorrente-observacao.entity";

export enum SituacaoEntregaEnum {
    INICIADO = 'INICIADO',
    BLOQUEADO = 'BLOQUEADO',
    ENTREGUE = 'ENTREGUE'
}

export const situacaoEntregaTypes: string[] =
    _.values(SituacaoEntregaEnum);

@Table({ tableName: 'documento_recorrente', paranoid: true })
export class DocumentoRecorrente extends Model<DocumentoRecorrente> {

    @ApiProperty() @Expose()
    id: number;

    @Column({ field: 'createdAt' })
    @CreatedAt
    @ApiProperty() @Expose()
    dataCriacao: Date;

    @Column({ field: 'updatedAt' })
    @UpdatedAt
    @ApiProperty() @Expose()
    dataAtualizacao: Date;

    @Column({ field: 'deletedAt' })
    @ApiProperty() @Expose()
    dataRemocao: Date;

    @Column({ field: 'deadline' })
    @ApiProperty() @Expose()
    prazo: Date;

    @Column({ field: 'referente_a' })
    @ApiProperty() @Expose()
    competenciaReferencia: Date;

    @Column({ field: 'situation', type: DataType.ENUM({ values: situacaoEntregaTypes }), validate: { isIn: [situacaoEntregaTypes] } })
    @ApiProperty({ enum: SituacaoEntregaEnum }) @Expose()
    situacao: SituacaoEntregaEnum;

    @Column({ field: 'deliveredAt' })
    @ApiProperty() @Expose()
    entrega: Date;

    @Column({ field: 'description' })
    @ApiProperty() @Expose()
    descricao: string;

    @Column({ field: 'documento_geral_id' }) @ForeignKey(() => DocumentoGeral)
    @Exclude()
    documentoGeralId: number;

    @BelongsTo(() => DocumentoGeral) @ApiProperty({ type: DocumentoGeral })
    @Expose()
    documentoGeral: DocumentoGeral;

    @Column({ field: 'usuario_ultima_alteracao_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    usuarioUltimaAlteracaoId: number;

    @BelongsTo(() => Usuario, { as: 'usuarioUltimaAlteracao', foreignKey: 'usuario_ultima_alteracao_id' }) @ApiProperty({ type: ReadUsuarioDto })
    @Expose() @Type(() => ReadUsuarioDto)
    usuarioUltimaAlteracao: Usuario;

    @Column({ field: 'responsavel_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    responsavelId: number;

    @BelongsTo(() => Usuario, { as: 'responsavel', foreignKey: 'responsavel_id' }) @ApiProperty({ type: ReadUsuarioDto })
    @Expose() @Type(() => ReadUsuarioDto)
    responsavel: Usuario;

    @Expose()
    @HasMany(() => DocumentoRecorrenteAnexo, 'documento_recorrente_id')
    anexos: DocumentoRecorrenteAnexo[];

    @Expose()
    @HasMany(() => DocumentoRecorrenteObservacao, 'documento_recorrente_id')
    observacoes: DocumentoRecorrenteObservacao[];

}
