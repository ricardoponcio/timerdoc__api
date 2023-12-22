import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from "sequelize-typescript";
import { DocumentoRecorrente } from "../../documento-recorrente/entities/documento-recorrente.entity";

@Table({ tableName: 'documento_recorrente_anexo', timestamps: true, paranoid: true })
export class DocumentoRecorrenteAnexo extends Model<DocumentoRecorrenteAnexo> {

    @Expose() @ApiProperty({ description: 'Identificador do anexo', type: Number })
    id: number;

    @Column({ field: 'createdAt' })
    @CreatedAt
    @Expose() @ApiProperty({ description: 'Data da criação do anexo', type: Date, format: 'date' })
    dataCriacao: Date;

    @Column({ field: 'updatedAt' })
    @UpdatedAt
    @Exclude()
    dataAtualizacao: Date;

    @Column({ field: 'deletedAt' })
    @DeletedAt
    @Exclude()
    dataRemocao: Date;

    @Column({ field: 'name' })
    @Expose() @ApiProperty({ description: 'Nome do arquivo autogerado no armazenamento', type: String })
    nome: string;

    @Column({ field: 'tamanho' })
    @Expose() @ApiProperty({ description: 'Tamanho do arquivo em bytes', type: BigInt })
    tamanho: bigint;

    @Column({ field: 'mimetype' })
    @Expose() @ApiProperty({ description: 'Mimetype do arquivo no Upload', type: String })
    tipoArquivo: string;

    @Column({ field: 'caminho_s3' })
    @Expose() @ApiProperty({ description: 'Caminho Pasta+Arquivo dentro do S3', type: String })
    caminhoS3: string;

    @Column({ field: 'bucket_s3' })
    @Expose() @ApiProperty({ description: 'Bucket do arquivo dentro do S3', type: String })
    bucketS3: string;

    @Column({ field: 'filename' })
    @Expose() @ApiProperty({ description: 'Nome original do arquivo feito upload', type: String })
    nomeArquivo: string;

    @Column({ field: 'reference' })
    @Expose() @ApiProperty({ description: 'URL de acesso ao registro', type: String })
    referencia: string;

    @Column({ field: 'documento_recorrente_id' }) @ForeignKey(() => DocumentoRecorrente)
    @Exclude()
    documentoRecorrenteId: number;

    @BelongsTo(() => DocumentoRecorrente)
    @Exclude()
    documentoRecorrente: DocumentoRecorrente;

}
