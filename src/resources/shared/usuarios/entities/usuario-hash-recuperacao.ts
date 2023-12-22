import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import * as _ from "lodash";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { UsuarioEmpresaConvite } from '../../usuario-empresa/entities/usuario-empresa-convite.entity';
import { ReadUsuarioDto } from '../dto/read-usuario.dto';
import { Usuario } from './usuario.entity';

export enum TipoHashEnum {
  RECOVER = 'P',
  REGISTER = 'R',
  INVITE = 'I',
  DELETE_ACCOUNT = 'D'
}

export const tipoHashTypes: string[] =
  _.values(TipoHashEnum);

export enum StatusHashEnum {
  ABERTO = 'ABERTO',
  UTILIZADO = 'UTILIZADO',
  CANCELADO = 'CANCELADO',
  EXPIRADO = 'EXPIRADO',
  SUBSTITUIDO = 'SUBSTITUIDO'
}

export const statusHashTypes: string[] =
  _.values(StatusHashEnum);

@Table({ tableName: 'usuario_hash_recuperacao', timestamps: false })
export class UsuarioHashRecuperacao extends Model<UsuarioHashRecuperacao> {
  @ApiProperty()
  @Expose()
  id?: number;

  @Column({ field: 'data_criacao' })
  @ApiProperty()
  @Expose()
  dataCriacao: Date;

  @Column({ field: 'data_resolucao' })
  @ApiProperty()
  @Expose()
  dataResolucao: Date;

  @Column({ field: 'expira_em' })
  @ApiProperty()
  @Expose()
  expiraEm: Date;

  @Column({ field: 'hash_recuperacao' })
  @Expose()
  @ApiProperty()
  hashRecuperacao: string;

  @Column({ field: 'tipo', type: DataType.ENUM({ values: tipoHashTypes }), validate: { isIn: [tipoHashTypes] } })
  @ApiProperty({ enum: TipoHashEnum }) @Expose()
  tipo: TipoHashEnum;

  @Column({ field: 'status', type: DataType.ENUM({ values: statusHashTypes }), validate: { isIn: [statusHashTypes] } })
  @ApiProperty({ enum: StatusHashEnum }) @Expose()
  status: StatusHashEnum;

  @Column({ field: 'usuario_id' }) @ForeignKey(() => Usuario)
  @Exclude()
  usuarioId: number;

  @BelongsTo(() => Usuario) @ApiProperty({ type: ReadUsuarioDto })
  @Expose() @Type(() => ReadUsuarioDto)
  usuario: Usuario;

  @Exclude()
  @ForeignKey(() => UsuarioEmpresaConvite)
  @Column({ field: 'usuario_empresa_convite_id' })
  usuarioEmpresaConviteId: number;

  @Expose() @Type(() => UsuarioEmpresaConvite)
  @ApiProperty({ type: () => UsuarioEmpresaConvite })
  @BelongsTo(() => UsuarioEmpresaConvite)
  usuarioEmpresaConvite: UsuarioEmpresaConvite;

  @Column({ field: 'substituido_por_id' }) @ForeignKey(() => UsuarioHashRecuperacao)
  @Exclude()
  substituidoPorId: number;

  @BelongsTo(() => UsuarioHashRecuperacao) @ApiProperty({ type: UsuarioHashRecuperacao })
  @Expose() @Type(() => UsuarioHashRecuperacao)
  substituidoPor: UsuarioHashRecuperacao;

}
