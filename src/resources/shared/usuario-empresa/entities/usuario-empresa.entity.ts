import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, Table } from "sequelize-typescript";
import { ReadEmpresaDto } from "../../empresas/dto/read-empresa.dto";
import { Empresa } from "../../empresas/entities/empresa.entity";
import { Role } from "../../role/entity/role.entity";
import { ReadUsuarioIdWithoutCompanyDto } from "../../usuarios/dto/read-usuario-id-wo-company.dto";
import { Usuario } from "../../usuarios/entities/usuario.entity";
import { UsuarioEmpresaConvite } from "./usuario-empresa-convite.entity";

@Table({ tableName: 'usuario_empresa', timestamps: true, paranoid: true })
export class UsuarioEmpresa extends Model<UsuarioEmpresa> {

    @AutoIncrement
    @Column({ primaryKey: true })
    id?: number;

    @Column
    ativo: boolean;

    @Column({ field: 'createdAt' })
    dataCriacao: Date;

    @Column({ field: 'updatedAt' })
    ultimaAtualizacao: Date;

    @Column({ field: 'deletedAt' })
    @ApiProperty()
    @Expose()
    dataRemocao: Date;

    @Exclude()
    @ForeignKey(() => Usuario)
    @Column({ field: 'usuario_id' })
    usuarioId: number;

    @Expose() @Type(() => ReadUsuarioIdWithoutCompanyDto)
    @ApiProperty({ type: () => Usuario })
    @BelongsTo(() => Usuario)
    usuario: Usuario;

    @Exclude()
    @ForeignKey(() => Role)
    @Column({ field: 'role_id' })
    roleId: number;

    @Expose()
    @ApiProperty({ type: () => Role })
    @BelongsTo(() => Role)
    role: Role;

    @Exclude()
    @ForeignKey(() => Empresa)
    @Column({ field: 'empresa_id' })
    empresaId: number;

    @Expose() @Type(() => ReadEmpresaDto)
    @ApiProperty({ type: () => Empresa })
    @BelongsTo(() => Empresa)
    empresa: Empresa;

    @Exclude()
    @ForeignKey(() => UsuarioEmpresaConvite)
    @Column({ field: 'usuario_empresa_convite_id' })
    usuarioEmpresaConviteId: number;

    @Expose() @Type(() => UsuarioEmpresaConvite)
    @ApiProperty({ type: () => UsuarioEmpresaConvite })
    @BelongsTo(() => UsuarioEmpresaConvite)
    usuarioEmpresaConvite: UsuarioEmpresaConvite;
}