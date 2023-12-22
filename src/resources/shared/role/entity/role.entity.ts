import { Expose } from 'class-transformer';
import { Column, Model, Table } from 'sequelize-typescript';

export enum RolesEnum {  // com base na migration
    ADM = 'ADM',
    GESTOR = 'Gestor',
    USUARIO = 'Usuario',
    VISUALIZADOR = 'Visualizador'
}

@Table({ tableName: 'role' })
export class Role extends Model {

    @Column({ allowNull: false }) @Expose()
    nome: string;

    @Column @Expose()
    ordem: number;

}
