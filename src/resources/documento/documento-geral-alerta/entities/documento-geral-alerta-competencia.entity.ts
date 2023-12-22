import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { DocumentoGeralAlerta } from "./documento-geral-alerta.entity";

@Table({ tableName: 'documento_geral_alerta_competencia', paranoid: false, timestamps: false })
export class DocumentoGeralAlertaCompetencia extends Model<DocumentoGeralAlertaCompetencia> {

    @ApiProperty() @Expose()
    id?: number;

    @Column({ field: 'referente_a' })
    @ApiProperty() @Expose()
    competenciaReferencia: Date;

    @Column({ field: 'documento_geral_alerta_id' }) @ForeignKey(() => DocumentoGeralAlerta)
    @Exclude()
    documentoGeralAlertaId: number;

    @BelongsTo(() => DocumentoGeralAlerta)
    @Exclude()
    documentoGeralAlerta: DocumentoGeralAlerta;

}
