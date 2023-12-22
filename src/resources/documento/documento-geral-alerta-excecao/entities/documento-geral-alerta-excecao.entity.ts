import { ReadSimpleUser } from "@app/resources/shared/usuarios/dto/read-simple-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DocumentoGeralAlerta } from "../../documento-geral-alerta/entities/documento-geral-alerta.entity";
import { DocumentoGeral } from "../../documento-geral/entities/documento-geral.entity";

@Table({ tableName: 'documento_geral_alerta_excecao', paranoid: true, timestamps: true })
export class DocumentoGeralAlertaExcecao extends Model<DocumentoGeralAlertaExcecao> {

    @Expose() @ApiProperty({ description: 'Identificador da exceção', type: Number })
    id?: number;

    @Column({ field: 'createdAt' })
    @Expose() @ApiProperty({ description: 'Data da criação da exceção', type: Date, format: 'date' })
    dataCriacao: Date;

    @Column({ field: 'updatedAt' })
    @Expose() @ApiProperty({ description: 'Data da ultima atualização da exceção', type: Date, format: 'date' })
    dataAtualizacao: Date;

    @Column({ field: 'deletedAt' })
    @Exclude()
    dataRemocao: Date;

    @Column({ field: 'competencia_referencia_excecao' })
    @Expose() @ApiProperty({ description: 'Data da competência da entrega (Início ... Periodicidade)', type: Date, format: 'date' })
    competenciaReferenciaExcecao: Date;

    @Column({ field: 'documento_geral_id' }) @ForeignKey(() => DocumentoGeral)
    @Exclude()
    documentoGeralId: number;

    @BelongsTo(() => DocumentoGeral)
    @Type(() => DocumentoGeral)
    @Expose() @ApiProperty({ description: 'Documento geral a qual a exceção está vinculada', type: DocumentoGeral })
    documentoGeral: DocumentoGeral;

    @Column({ field: 'documento_geral_alerta_id' }) @ForeignKey(() => DocumentoGeralAlerta)
    @Exclude()
    documentoGeralAlertaId: number;

    @BelongsTo(() => DocumentoGeralAlerta)
    @Type(() => DocumentoGeralAlerta)
    @Exclude()
    documentoGeralAlerta: DocumentoGeralAlerta;

    @Column({ field: 'usuario_criacao_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    usuarioCriacaoId: number;

    @BelongsTo(() => Usuario)
    @Type(() => ReadSimpleUser)
    @Expose() @ApiProperty({ description: 'Usuário que criou a exceção', type: ReadSimpleUser })
    usuarioCriacao: Usuario;

}
