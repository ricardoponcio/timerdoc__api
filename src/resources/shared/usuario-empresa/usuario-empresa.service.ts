import { Role } from '@app/resources/shared/role/entity/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { RoleService } from '@shared/role/role.service';
import { UsuarioEmpresa } from '@shared/usuario-empresa/entities/usuario-empresa.entity';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';
import { UserPayload } from 'src/config/security/auth/user.payload.dto';
import { UsuarioEmpresaConvite } from './entities/usuario-empresa-convite.entity';
import { UsuarioEmpresaConviteService } from './usuario-empresa-convite.service';

@Injectable()
export class UsuarioEmpresaService {

    constructor(
        @InjectModel(UsuarioEmpresa)
        private respository: typeof UsuarioEmpresa,
        private readonly roleService: RoleService,
        private readonly usuarioEmpresaConviteService: UsuarioEmpresaConviteService) { }

    async linkUserAndCompany(user: Usuario | UserPayload, company: Empresa | UserCompanyPayload) {
        const myFirstRole = await this.roleService.findADMRole();
        return this.linkUserAndCompanyWithRole(user, company, myFirstRole);
    }

    async linkUserAndCompanyWithRole(user: Usuario | UserPayload, company: Empresa | UserCompanyPayload, role: Role, invite?: UsuarioEmpresaConvite) {
        const usuarioEmpresa = new UsuarioEmpresa();
        usuarioEmpresa.empresaId = company instanceof Empresa ? company.id : company.sub.empresaId;
        usuarioEmpresa.usuarioId = user.id;
        usuarioEmpresa.roleId = role.id;
        usuarioEmpresa.usuarioEmpresaConviteId = invite?.id;
        // return this.respository.create(usuarioEmpresa);
        return usuarioEmpresa.save();
    }

    async linkAsInvite(usuario: Usuario, invite: UsuarioEmpresaConvite) {
        return await this.linkUserAndCompanyWithRole(usuario, invite.empresaConvite, invite.role, invite);
    }

    deleteFromCompany(empresa: Empresa | UserCompanyPayload, usuario: Usuario | number, usuarioLogado: UserPayload) {
        const companyId = empresa instanceof Empresa ? empresa.id : empresa.sub.empresaId;
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        id: companyId
                    }
                }, {
                    model: Usuario,
                    where: {
                        id: usuario instanceof Usuario ? usuario.id : usuario
                    }
                }
            ]
        })
            .then(async ues => {
                for (let ue of ues) {
                    await this.usuarioEmpresaConviteService.comunicarEncerramentoRelacao(ue.empresa, ue.usuario, usuarioLogado);
                }
                return ues;
            })
            .then(ues => ues.forEach(ue => ue.destroy()));
    }

    deleteAllFromCompany(empresa: Empresa | UserCompanyPayload, usuarioLogado: UserPayload) {
        const companyId = empresa instanceof Empresa ? empresa.id : empresa.sub.empresaId;
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        id: companyId
                    }
                }, Usuario
            ]
        })
            .then(async ues => {
                for (let ue of ues) {
                    await this.usuarioEmpresaConviteService.comunicarEncerramentoRelacao(ue.empresa, ue.usuario, usuarioLogado);
                }
                return ues;
            })
            .then(ues => ues.forEach(ue => ue.destroy()));
    }

    deleteFromUser(usuario: Usuario | UserPayload, empresa: Empresa | number) {
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        id: empresa instanceof Empresa ? empresa.id : empresa
                    }
                }, {
                    model: Usuario,
                    where: {
                        id: usuario.id
                    }
                }
            ]
        })
            .then(async ues => {
                for (let ue of ues) {
                    await this.usuarioEmpresaConviteService.comunicarEncerramentoRelacao(ue.empresa, ue.usuario, usuario);
                }
                return ues;
            })
            .then(ues => ues.forEach(ue => ue.destroy()));
    }

    deleteAllFromUser(usuario: Usuario | UserPayload) {
        return this.respository.findAll({
            include: [
                {
                    model: Usuario,
                    where: {
                        id: usuario.id
                    }
                }, Empresa
            ]
        })
            .then(async ues => {
                for (let ue of ues) {
                    await this.usuarioEmpresaConviteService.comunicarEncerramentoRelacao(ue.empresa, ue.usuario, usuario);
                }
                return ues;
            })
            .then(ues => ues.forEach(ue => ue.destroy()));
    }

    findByEmpresaId(empresaId: number) {
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        id: empresaId
                    }
                },
                Usuario,
                Role
            ]
        });
    }

    findByUserId(userId: number) {
        return this.respository.findAll({
            include: [
                {
                    model: Usuario,
                    where: {
                        id: userId
                    }
                }
            ]
        });
    }

    findByEmpresaIdAndUserId(usuarioId: number, empresaId: number): Promise<UsuarioEmpresa[]> {
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        id: empresaId
                    }
                }, {
                    model: Usuario,
                    where: {
                        id: usuarioId
                    }
                }, Role
            ]
        });
    }

    findByEmpresaDocAndUserId(usuarioId: number, cnpj: string) {
        return this.respository.findAll({
            include: [
                {
                    model: Empresa,
                    where: {
                        cnpj
                    }
                }, {
                    model: Usuario,
                    where: {
                        id: usuarioId
                    }
                }
            ]
        });
    }

    changeRole(usuario: Usuario | number, empresa: Empresa | number, roleName: string): Promise<UsuarioEmpresa> {
        return this.respository.findOne({
            where: {
                usuarioId: usuario instanceof Usuario ? usuario.id : usuario,
                empresaId: empresa instanceof Empresa ? empresa.id : empresa
            }
        })
            .then(async (ue: UsuarioEmpresa) => {
                const role = await this.roleService.findByName(roleName);
                return ue.update({ roleId: role.id });
            });
    }

    async usuarioPertenceEmpresa(usuarioId: number, empresaId: number): Promise<boolean> {
        const ues = await this.findByEmpresaIdAndUserId(usuarioId, empresaId);
        return ues && ues.length > 0;
    }

}
