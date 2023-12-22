import { ReadSimpleUser } from '@app/resources/shared/usuarios/dto/read-simple-usuario.dto';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import * as _ from 'lodash';
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

export enum AuditoriaOperacaoEnum {
  INSERT = 'I',
  UPDATE = 'U',
  DELETE = 'D',
}

export const auditoriaOperacaoTypes: string[] = _.values(AuditoriaOperacaoEnum);

@Table({ timestamps: false, tableName: 'auditoria', schema: 'auditoria' })
export class Auditoria extends Model {
  id: number;

  @Column({ field: 'entity_id' })
  entityId: number;

  @ForeignKey(() => Usuario)
  @Column({ field: 'user_id' })
  userId: number;

  @BelongsTo(() => Usuario) @ApiProperty({ type: ReadSimpleUser })
  @Expose() @Type(() => ReadSimpleUser)
  user: Usuario;

  @Column({ field: 'createdAt' })
  dataCriacao: Date;

  @Column({
    field: 'operation',
    type: DataType.ENUM({ values: auditoriaOperacaoTypes }),
    validate: { isIn: [auditoriaOperacaoTypes] },
  })
  operacao: AuditoriaOperacaoEnum;

  @Column({ field: 'table_name' })
  tableName: number;

  @Column({ field: 'data' })
  entidade: string;
}
