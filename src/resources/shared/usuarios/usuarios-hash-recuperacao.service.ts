import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { randomUUID } from 'crypto';
import { Includeable, Op } from 'sequelize';
import { Empresa } from '../empresas/entities/empresa.entity';
import { Role } from '../role/entity/role.entity';
import { UsuarioEmpresaConvite } from '../usuario-empresa/entities/usuario-empresa-convite.entity';
import { StatusHashEnum, TipoHashEnum, UsuarioHashRecuperacao } from './entities/usuario-hash-recuperacao';
import * as moment from 'moment';

@Injectable()
export class UsuariosHashRecuperacaoService {
  constructor(
    @InjectModel(UsuarioHashRecuperacao)
    private repository: typeof UsuarioHashRecuperacao
  ) { }

  async create(userHash: Usuario | UsuarioEmpresaConvite, tipo: TipoHashEnum): Promise<UsuarioHashRecuperacao> {
    const existente = await this.__findOpen(null, tipo, userHash);

    const hash = new UsuarioHashRecuperacao();
    hash.dataCriacao = new Date();
    hash.hashRecuperacao = randomUUID();
    hash.tipo = tipo;
    hash.status = StatusHashEnum.ABERTO;
    hash.usuarioId = userHash && userHash instanceof Usuario ? userHash.id : null;
    hash.usuarioEmpresaConviteId = userHash && userHash instanceof UsuarioEmpresaConvite ? userHash.id : null;
    if (tipo === TipoHashEnum.DELETE_ACCOUNT) {
      hash.expiraEm = moment().add(1, 'hours').toDate();
    }
    const novoHash = await hash.save();

    if (existente) await this.susbtituirHash(existente.hashRecuperacao, novoHash);
    return novoHash;
  }

  recover(hashRecuperacao: string, tipo: TipoHashEnum): Promise<UsuarioHashRecuperacao> {
    return this.__findOpen(hashRecuperacao, null, null, [
      Usuario,
      {
        model: UsuarioEmpresaConvite,
        include: [Empresa, Usuario, Role]
      }
    ]);
  }

  utilizarHash(hashRecuperacao: string | UsuarioHashRecuperacao): Promise<UsuarioHashRecuperacao> {
    return this.__findOpen(hashRecuperacao, null, null)
      .then(hash => hash.update({ status: StatusHashEnum.UTILIZADO, dataResolucao: new Date() }));
  }

  expirarHash(hashRecuperacao: string | UsuarioHashRecuperacao): Promise<UsuarioHashRecuperacao> {
    return this.__findOpen(hashRecuperacao, null, null)
      .then(hash => hash.update({ status: StatusHashEnum.EXPIRADO, dataResolucao: new Date() }));
  }

  cancelarHash(hashRecuperacao: string | UsuarioHashRecuperacao): Promise<UsuarioHashRecuperacao> {
    return this.__findOpen(hashRecuperacao, null, null)
      .then(hash => hash.update({ status: StatusHashEnum.CANCELADO, dataResolucao: new Date() }));
  }

  susbtituirHash(hashRecuperacao: string | UsuarioHashRecuperacao, novoHash: UsuarioHashRecuperacao): Promise<UsuarioHashRecuperacao> {
    return this.__findOpen(hashRecuperacao, null, null)
      .then(hash => hash.update({ status: StatusHashEnum.SUBSTITUIDO, substituidoPorId: novoHash.id, dataResolucao: new Date() }));
  }

  findAndUseHash(invite: UsuarioEmpresaConvite) {
    return this.__findOpen(null, TipoHashEnum.INVITE, invite).then((hash) => this.utilizarHash(hash));
  }

  findAndCancelHash(invite: UsuarioEmpresaConvite) {
    return this.__findOpen(null, TipoHashEnum.INVITE, invite).then((hash) => this.cancelarHash(hash));
  }

  private __findOpen(hashRecuperacao: UsuarioHashRecuperacao | string | null, tipoHash: TipoHashEnum | null, createdTo: Usuario | UsuarioEmpresaConvite | null, includes?: Includeable[]): Promise<UsuarioHashRecuperacao> {
    return this.repository
      .findOne({
        where: {
          ...(hashRecuperacao ?
            hashRecuperacao instanceof UsuarioHashRecuperacao ?
              { hashRecuperacao: hashRecuperacao.hashRecuperacao } :
              { hashRecuperacao }
            : {}),
          status: StatusHashEnum.ABERTO,
          expiraEm: {
            [Op.or]: {
              [Op.is]: null,
              [Op.gt]: new Date()
            }
          },
          ...(tipoHash ? { tipo: tipoHash } : {}),
          ...(createdTo ?
            createdTo instanceof UsuarioEmpresaConvite ?
              { usuarioEmpresaConviteId: createdTo.id } :
              { usuarioId: createdTo.id }
            : {})
        },
        include: includes
      });
  }

}
