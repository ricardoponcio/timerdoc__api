import { ApiProperty } from '@nestjs/swagger';
import { Plano } from '@shared/planos/plano.entity';
import { UsuarioEmpresa } from '@shared/usuario-empresa/entities/usuario-empresa.entity';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { Expose, Type } from 'class-transformer';
import {
  BelongsTo,
  BelongsToMany,
  Column,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';

@Table({
  tableName: 'empresa',
  paranoid: true
})
export class Empresa extends Model<Empresa> {
  @ApiProperty()
  @Expose()
  id?: number;

  @Column({
    allowNull: true,
    unique: true,
  })
  @Expose()
  @ApiProperty()
  cnpj: string;

  @Column({ allowNull: true, field: 'razao_social' })
  @Expose()
  @ApiProperty()
  razaoSocial: string;

  @Column({ allowNull: true })
  @Expose()
  @ApiProperty()
  fantasia: string;

  @Column({ field: 'deletedAt' })
  @ApiProperty()
  @Expose()
  dataRemocao: Date;

  @ForeignKey(() => Plano)
  @Column({ field: 'plano_id' })
  @Expose()
  @ApiProperty()
  planoId: number;

  @BelongsTo(() => Plano)
  @Type(() => Plano)
  plano: Plano;

  @BelongsToMany(() => Usuario, () => UsuarioEmpresa)
  @Expose()
  usuarios: Usuario[];
}
