import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { UserPayload } from '@app/config/security/auth/user.payload.dto';
import { InformacaoRemetente } from '@app/resources/email/dto/envio-emails-informacoes-remetente.dto';
import { InformacaoDestinatario } from '@app/resources/email/dto/envio-emails-informacoes.dto';
import { EmailService } from '@app/resources/email/email.service';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Role } from '../role/entity/role.entity';
import { RoleService } from '../role/role.service';
import { TipoHashEnum } from '../usuarios/entities/usuario-hash-recuperacao';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { UsuariosHashRecuperacaoService } from '../usuarios/usuarios-hash-recuperacao.service';
import { StatusAceiteEnum, UsuarioEmpresaConvite } from './entities/usuario-empresa-convite.entity';

@Injectable()
export class UsuarioEmpresaConviteService {

    constructor(
        @InjectModel(UsuarioEmpresaConvite)
        private respository: typeof UsuarioEmpresaConvite,
        private readonly emailService: EmailService,
        private readonly roleService: RoleService,
        private readonly usuarioHashRecuperacaoService: UsuariosHashRecuperacaoService) { }

    async doAInvite(usuarioOrigem: Usuario, empresaLogada: Empresa, roleEscolhida: Role | string, novoUsuario: { nome?: string, email?: string, usuarioExistente?: Usuario }) {
        const role = await this.roleService.findByName(roleEscolhida instanceof Role ? roleEscolhida.nome : roleEscolhida);
        const convite = new UsuarioEmpresaConvite();
        convite.dataCriacao = new Date();
        convite.emailConvidado = novoUsuario?.email ?? novoUsuario?.usuarioExistente?.email;
        convite.nomeConvidado = novoUsuario?.nome ?? novoUsuario?.usuarioExistente?.nome;
        convite.usuarioOrigemId = usuarioOrigem.id;
        convite.usuarioCriadoId = novoUsuario?.usuarioExistente?.id;
        convite.empresaConviteId = empresaLogada.id;
        convite.roleId = role.id;
        convite.status = null;
        convite.dataRemocao = null;
        await convite.save();
        const hash = await this.usuarioHashRecuperacaoService.create(convite, TipoHashEnum.INVITE);
        this.emailService.sendNewInviteEmail(
            new InformacaoDestinatario(
                convite.emailConvidado,
                convite.nomeConvidado,
                hash.hashRecuperacao
            ),
            new InformacaoRemetente(
                usuarioOrigem.nome,
                empresaLogada.razaoSocial
            ),
            !!(novoUsuario?.usuarioExistente)
        );
        return this.buscarConvite(convite.id);
    }

    buscarConvite(conviteId: number) {
        return this.respository.findOne({ where: { id: conviteId, status: { [Op.eq]: null } }, include: [Empresa, Role] });
    }

    usarConvite(convite: UsuarioEmpresaConvite, aceite: StatusAceiteEnum, usuarioCriado: Usuario) {
        return this.respository.findByPk(convite.id)
            .then(conviteDB => conviteDB.update({ status: aceite, usuarioCriadoId: usuarioCriado.id }))
            .then(conviteDB => this.usuarioHashRecuperacaoService.findAndUseHash(conviteDB));
    }

    usarConviteUsuarioJaCriado(convite: UsuarioEmpresaConvite, aceite: StatusAceiteEnum) {
        return this.respository.findByPk(convite.id)
            .then(conviteDB => conviteDB.update({ status: aceite }))
            .then(conviteDB => this.usuarioHashRecuperacaoService.findAndUseHash(conviteDB));;
    }

    async buscarConviteAberto(email: string, empresaLogada: Empresa) {
        return this.respository.findOne({
            where: {
                empresaConviteId: empresaLogada.id, emailConvidado: email, status: { [Op.eq]: null },
                desistenciaUsuarioId: { [Op.eq]: null }, dataRemocao: { [Op.eq]: null }
            }
        })
    }

    async buscarConvitesAbertos(empresaLogada: Empresa) {
        return this.respository.findAll({
            where: {
                empresaConviteId: empresaLogada.id, status: { [Op.eq]: null },
                desistenciaUsuarioId: { [Op.eq]: null }, dataRemocao: { [Op.eq]: null }
            },
            include: [
                Role
            ]
        })
    }

    async buscarConvitesAbertosDoUsuario(usuarioLogado: Usuario | UserPayload) {
        return this.respository.findAll({
            where: {
                [Op.or]: [
                    { usuarioCriadoId: usuarioLogado.id },
                    { emailConvidado: usuarioLogado.email }
                ], status: { [Op.eq]: null },
                desistenciaUsuarioId: { [Op.eq]: null }, dataRemocao: { [Op.eq]: null }
            },
            include: [
                Empresa, Usuario, Role
            ]
        })
    }

    comunicarEncerramentoRelacao(empresa: Empresa | number, usuarioRemovido: Usuario | UserPayload | UserCompanyPayload, usuarioLogado: Usuario | UserPayload) {
        const empresaId = empresa instanceof Empresa ? empresa.id : empresa;
        const usuarioId = usuarioRemovido.id;
        const usuarioLogadoId = usuarioLogado.id;
        return this.respository.findOne({
            where: {
                empresaConviteId: empresaId,
                usuarioCriadoId: usuarioId,
                dataRemocao: { [Op.eq]: null }
            }
        })
            .then(convite => !convite ? null : convite.update({ desistenciaUsuarioId: usuarioLogadoId }))
            .then(convite => !convite ? null : convite.destroy());
    }

    comunicarEncerramentoRelacaoConvite(usuarioEmpresaConvite: UsuarioEmpresaConvite, usuarioLogado: Usuario | UserPayload) {
        return this.respository.findByPk(usuarioEmpresaConvite.id)
            .then(convite => convite.update({ desistenciaUsuarioId: usuarioLogado.id }))
            .then(convite => convite.destroy());
    }

}
