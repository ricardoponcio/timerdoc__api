import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { ReadEmpresaDto } from '@app/resources/shared/empresas/dto/read-empresa.dto';
import { Empresa } from '@app/resources/shared/empresas/entities/empresa.entity';
import { ReadSimpleUser } from '@app/resources/shared/usuarios/dto/read-simple-usuario.dto';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import * as _ from "lodash";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

export enum NivelAtributoEnum {
  EMPRESA = 'EMPRESA',
  DOCUMENTO = 'DOCUMENTO'
}

export const nivelAtributoTypes: string[] =
  _.values(NivelAtributoEnum);

@Table({
  tableName: 'variavel',
  paranoid: true
})
export class Variavel extends Model<Variavel> {
  @ApiProperty()
  @Expose()
  id?: number;

  @Column({ field: 'createdAt' })
  @ApiProperty()
  @Expose()
  createdAt: Date;

  @Column({ field: 'updatedAt' })
  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @Column({ field: 'deletedAt' })
  @ApiProperty()
  @Expose()
  deletedAt: Date;

  @Column({ field: 'nivel', type: DataType.ENUM({ values: nivelAtributoTypes }), validate: { isIn: [nivelAtributoTypes] } })
  @ApiProperty({ enum: NivelAtributoEnum }) @Expose()
  nivel: NivelAtributoEnum;

  @Column({ field: 'chave' })
  @ApiProperty()
  @Expose()
  chave: String;

  @Column({ field: 'descricao' })
  @ApiProperty()
  @Expose()
  descricao: String;

  @Column({ field: 'valor' })
  @ApiProperty()
  @Expose()
  valor: String;

  @ForeignKey(() => Usuario)
  @Column({ field: 'usuario_id' })
  @Expose()
  @ApiProperty()
  usuarioId: number;

  @BelongsTo(() => Usuario)
  @Type(() => ReadSimpleUser)
  usuario: Usuario;

  @ForeignKey(() => Empresa)
  @Column({ field: 'empresa_id' })
  @Expose()
  @ApiProperty()
  empresaId: number;

  @BelongsTo(() => Empresa)
  @Type(() => ReadEmpresaDto)
  empresa: Empresa;

  @ForeignKey(() => DocumentoGeral)
  @Column({ field: 'documento_geral_id' })
  @Expose()
  @ApiProperty()
  documentoGeralId: number;

  @BelongsTo(() => DocumentoGeral)
  @Type(() => DocumentoGeral)
  documentoGeral: DocumentoGeral;

}
