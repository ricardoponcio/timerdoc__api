import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table } from "sequelize-typescript";
import { ReadUsuarioDto } from "@app/resources/shared/usuarios/dto/read-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { DocumentoRecorrente } from "../../documento-recorrente/entities/documento-recorrente.entity";

@Table({ tableName: 'documento_recorrente_observacao', timestamps: false })
export class DocumentoRecorrenteObservacao extends Model<DocumentoRecorrenteObservacao> {

    @ApiProperty() @Expose()
    id: number;

    @CreatedAt
    @ApiProperty() @Expose()
    @Column({ field: 'dataHora' })
    dataCriacao: Date;

    @Column({ field: 'observacao' })
    @ApiProperty() @Expose()
    observacao: string;

    @Column({ field: 'documento_recorrente_id' }) @ForeignKey(() => DocumentoRecorrente)
    documentoRecorrenteId: number;

    @BelongsTo(() => DocumentoRecorrente)
    documentoRecorrente: DocumentoRecorrente;

    @Column({ field: 'usuario_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    usuarioId: number;

    @BelongsTo(() => Usuario) @ApiProperty({ type: ReadUsuarioDto })
    @Expose() @Type(() => ReadUsuarioDto)
    usuario: Usuario;

}
