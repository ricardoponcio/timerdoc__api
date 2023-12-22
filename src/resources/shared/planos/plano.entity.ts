import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Column, Model, Table } from 'sequelize-typescript';

export enum PlanosEnum {  // com base na migration
    BASICO = 'BASICO',
    SIMPLES = 'SIMPLES',
    COMPLETO = 'COMPLETO'
}

@Table({ tableName: 'planos', paranoid: true })
export class Plano extends Model {

    @ApiProperty() @Expose()
    id?: number;

    @Column({ allowNull: false })
    @ApiProperty() @Expose()
    nome: string;

    @Column
    ordem: number;

    @Column({ field: 'deletedAt' })
    @ApiProperty() @Expose()
    dataRemocao: Date;

}
