import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import * as _ from "lodash";
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { ReadEmpresaDto } from "../../empresas/dto/read-empresa.dto";
import { Empresa } from "../../empresas/entities/empresa.entity";
import { Role } from "../../role/entity/role.entity";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { ReadSimpleUser } from "../../usuarios/dto/read-simple-usuario.dto";

export enum StatusAceiteEnum {
    ACEITO = 'A',
    RECUSADO = 'D'
}

export const statusAceiteTypes: string[] =
    _.values(StatusAceiteEnum);

@Table({ tableName: 'usuario_empresa_convite', timestamps: true, paranoid: true })
export class UsuarioEmpresaConvite extends Model<UsuarioEmpresaConvite> {

    @Expose()
    id?: number;

    @Expose()
    @Column({ field: 'createdAt' })
    dataCriacao: Date;

    @Exclude()
    @Column({ field: 'deletedAt' })
    dataRemocao: Date;

    @Expose()
    @Column({ field: 'email_convidado' })
    emailConvidado: string;

    @Expose()
    @Column({ field: 'nome_convidado' })
    nomeConvidado: string;

    @Exclude()
    @Column({ field: 'status', type: DataType.ENUM({ values: statusAceiteTypes }), validate: { isIn: [statusAceiteTypes] } })
    @ApiProperty({ enum: StatusAceiteEnum })
    status: StatusAceiteEnum;

    @Exclude()
    @ForeignKey(() => Usuario)
    @Column({ field: 'usuario_origem_id' })
    usuarioOrigemId: number;

    @Expose() @Type(() => ReadSimpleUser)
    @ApiProperty({ type: () => Usuario })
    @BelongsTo(() => Usuario)
    usuarioOrigem: Usuario;

    @Exclude()
    @ForeignKey(() => Usuario)
    @Column({ field: 'usuario_criacao_id' })
    usuarioCriadoId: number;

    // @Expose() @Type(() => ReadUsuarioWithoutCompanyDto)
    // @ApiProperty({ type: () => Usuario })
    // @BelongsTo(() => Usuario)
    // usuarioCriado: Usuario;

    @Exclude()
    @ForeignKey(() => Empresa)
    @Column({ field: 'empresa_convite_id' })
    empresaConviteId: number;

    @Expose() @Type(() => ReadEmpresaDto)
    @ApiProperty({ type: () => Empresa })
    @BelongsTo(() => Empresa)
    empresaConvite: Empresa;

    @Exclude()
    @ForeignKey(() => Role)
    @Column({ field: 'role_id' })
    roleId: number;

    @Expose()
    @ApiProperty({ type: () => Role })
    @BelongsTo(() => Role)
    role: Role;

    @Exclude()
    @ForeignKey(() => Usuario)
    @Column({ field: 'desistencia_usuario_id' })
    desistenciaUsuarioId: number;

    // @Expose() @Type(() => ReadUsuarioWithoutCompanyDto)
    // @ApiProperty({ type: () => Usuario })
    // @BelongsTo(() => Usuario)
    // desistenciaUsuario: Usuario;

}