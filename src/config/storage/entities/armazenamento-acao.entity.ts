import { ReadEmpresaDto } from "@app/resources/shared/empresas/dto/read-empresa.dto";
import { Empresa } from "@app/resources/shared/empresas/entities/empresa.entity";
import { ReadSimpleUser } from "@app/resources/shared/usuarios/dto/read-simple-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import * as _ from "lodash";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";

export enum TipoArquivoEnum {  // com base na migration
    OcorrenciaAnexo = 'OCORRENCIA_ANEXO',
    Logo = 'LOGO',
    ImagemPerfil = 'IMAGEM_PERFIL'
}

export const tipoArquivosTypes: string[] =
    _.values(TipoArquivoEnum) //import _ from "lodash";

export enum AcaoEnum {  // com base na migration
    Create = 'CREATE',
    Delete = 'DELETE',
    Download = 'DOWNLOAD'
}

export const acoesTypes: string[] =
    _.values(AcaoEnum) //import _ from "lodash";

@Table({ tableName: 'armazenamento_acao', timestamps: false })
export class ArmazenamentoAcao extends Model<ArmazenamentoAcao> {

    @ApiProperty() @Expose()
    id?: number;

    @Column({ field: 'data' })
    @ApiPropertyOptional({ type: Date, format: 'date' }) @Expose()
    data: Date;

    @Column({ type: DataType.ENUM({ values: tipoArquivosTypes }), validate: { isIn: [tipoArquivosTypes] } })
    @ApiProperty({ enum: TipoArquivoEnum }) @Expose()
    tipo: TipoArquivoEnum;

    @Column({ type: DataType.ENUM({ values: acoesTypes }), validate: { isIn: [acoesTypes] } })
    @ApiProperty({ enum: AcaoEnum }) @Expose()
    acao: AcaoEnum;

    @Column({ field: 'bucket' })
    @ApiProperty({ type: String }) @Expose()
    bucket: String;

    @Column({ field: 'caminho_s3' })
    @ApiProperty({ type: String }) @Expose()
    caminhoS3: String;

    @Column({ field: 'md5' })
    @ApiProperty({ type: String }) @Expose()
    md5: String;

    @Column({ field: 'tamanho' })
    @ApiPropertyOptional({ type: BigInt }) @Expose()
    tamanho: bigint;

    @Column({ field: 'usuario_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    usuarioId: number;

    @BelongsTo(() => Usuario) @ApiProperty({ type: ReadSimpleUser })
    @Expose() @Type(() => ReadSimpleUser)
    usuario: Usuario;

    @Column({ field: 'empresa_id' }) @ForeignKey(() => Empresa)
    @Exclude()
    empresaId: number;

    @BelongsTo(() => Empresa) @ApiProperty({ type: ReadEmpresaDto })
    @Expose() @Type(() => ReadEmpresaDto)
    empresa: Empresa;

}
