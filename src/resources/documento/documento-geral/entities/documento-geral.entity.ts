import { ReadEmpresaDto } from "@app/resources/shared/empresas/dto/read-empresa.dto";
import { Empresa } from "@app/resources/shared/empresas/entities/empresa.entity";
import { ReadUsuarioDto } from "@app/resources/shared/usuarios/dto/read-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import * as _ from "lodash";
import { BelongsTo, Column, CreatedAt, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import { DocumentoGeralAlerta } from "../../documento-geral-alerta/entities/documento-geral-alerta.entity";

export enum PeriodicidadeEnum {  // com base na migration
    DIA = 'DIA',
    SEMANA = 'SEMANA',
    MES = 'MES',
    TRIMESTRE = 'TRIMESTRE',
    SEMESTRE = 'SEMESTRE',
    ANO = 'ANO'
}

export const periodicidadeTypes: string[] =
    _.values(PeriodicidadeEnum) //import _ from "lodash";
// [
//     'DIA',
//     'SEMANA',
//     'MES',
//     'TRIMESTRE',
//     'SEMESTRE',
//     'ANO'
// ]

@Table({ tableName: 'documento_geral', paranoid: true })
export class DocumentoGeral extends Model<DocumentoGeral> {

    @ApiProperty() @Expose()
    id?: number;

    @Column
    @ApiProperty() @Expose()
    nome: string;

    @Column
    @ApiProperty() @Expose()
    descricao: string;

    @Column({ field: 'ref_arquivo_geral' })
    @Exclude()
    refArquivoGeral?: string;

    @Column({ field: 'data_lancamento' }) @CreatedAt
    @ApiProperty() @Expose()
    lancamento: Date;

    @Column({ field: 'deletedAt' })
    @ApiProperty() @Expose()
    dataRemocao: Date;

    @Column
    @ApiProperty() @Expose()
    recorrencia: number;

    @Column({ type: DataType.ENUM({ values: periodicidadeTypes }), validate: { isIn: [periodicidadeTypes] } })
    @ApiProperty({ enum: PeriodicidadeEnum }) @Expose()
    periodicidade: PeriodicidadeEnum;

    @Column({ field: 'data_inicio_contagem' })
    @ApiProperty({ type: Date, format: 'date' }) @Expose()
    inicioContagem: Date;

    @Column({ field: 'data_fim_contagem' })
    @ApiPropertyOptional({ type: Date, format: 'date' }) @Expose()
    fimContagem: Date;

    @Column({ field: 'valor_padrao' })
    @ApiPropertyOptional() @Expose()
    valorPadrao: number;

    @Column({ field: 'dias_aviso_vencimento' })
    @ApiPropertyOptional() @Expose()
    diasAvisoVencimento: number;

    @Column({ field: 'usuario_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    usuarioId: number;

    @BelongsTo(() => Usuario, { as: 'usuario', foreignKey: 'usuario_id' }) @ApiProperty({ type: ReadUsuarioDto })
    @Expose() @Type(() => ReadUsuarioDto)
    usuario: Usuario;

    @Column({ field: 'responsavel_id' }) @ForeignKey(() => Usuario)
    @Exclude()
    responsavelId: number;

    @BelongsTo(() => Usuario, { as: 'responsavel', foreignKey: 'responsavel_id' }) @ApiProperty({ type: ReadUsuarioDto })
    @Expose() @Type(() => ReadUsuarioDto)
    responsavel: Usuario;

    @Column({ field: 'empresa_id' }) @ForeignKey(() => Empresa)
    @Exclude()
    empresaId: number;

    @BelongsTo(() => Empresa) @ApiProperty({ type: ReadEmpresaDto })
    @Expose() @Type(() => ReadEmpresaDto)
    empresa: Empresa;

    @Expose()
    @HasMany(() => DocumentoGeralAlerta, 'documento_geral_id')
    alertas: DocumentoGeralAlerta[];

}
