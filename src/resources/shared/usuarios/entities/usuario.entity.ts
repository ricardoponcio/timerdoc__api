import { ApiProperty } from '@nestjs/swagger';
import { UsuarioEmpresa } from '@shared/usuario-empresa/entities/usuario-empresa.entity';
import { Exclude, Expose } from 'class-transformer';
import { Column, HasMany, Length, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'usuario', paranoid: true })
export class Usuario extends Model<Usuario> {
  @ApiProperty()
  @Expose()
  id?: number;

  @Length({ max: 150 })
  @Column
  @Expose()
  @ApiProperty()
  nome: string;

  @Length({ max: 255 })
  @Column
  @Expose()
  @ApiProperty({ maxLength: 255 })
  email: string;

  @Length({ min: 8, max: 255 })
  @Column
  @Exclude()
  password: string;

  @Column({
    allowNull: false,
    defaultValue: true,
  })
  @Expose()
  @ApiProperty()
  ativo: boolean;

  @Column({
    allowNull: false,
    defaultValue: false,
  })
  @Expose()
  @ApiProperty()
  verificado: boolean;

  @Column({ allowNull: true })
  @Expose()
  @ApiProperty()
  telefone: string;

  @Column({ allowNull: true, field: 'idioma_preferido' })
  @Expose()
  @ApiProperty()
  idiomaPreferido: string;

  @HasMany(() => UsuarioEmpresa, 'usuario_id')
  @Expose()
  empresas: UsuarioEmpresa[];

  @Column({ field: 'deletedAt' })
  @ApiProperty()
  @Expose()
  dataRemocao: Date;
}
