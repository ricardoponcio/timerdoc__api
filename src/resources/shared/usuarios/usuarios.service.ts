import { jwtConstants } from '@app/config/security/auth/constants';
import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Role } from '@app/resources/shared/role/entity/role.entity';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { UsuarioEmpresa } from '@shared/usuario-empresa/entities/usuario-empresa.entity';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { Includeable } from 'sequelize';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';
import { UsuarioEmpresaConvite } from '../usuario-empresa/entities/usuario-empresa-convite.entity';
import { CompleteUsuarioRegisterDto } from './dto/complete-usuario-register.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario)
    private repoUser: typeof Usuario,
    private usuarioEmpresaService: UsuarioEmpresaService,
    private jwtService: JwtService
  ) { }

  async create(novoUser: Usuario) {
    novoUser.password = randomUUID(); // Campo no DB é nao nulo, só pra passar, nao pode autenticar pq verificado é false
    novoUser.ativo = true;
    novoUser.verificado = false;

    novoUser.telefone = novoUser.telefone;
    novoUser.idiomaPreferido = novoUser.idiomaPreferido;

    if (novoUser.password) {
      novoUser.password = await bcrypt.hash(
        novoUser.password,
        await bcrypt.genSalt(),
      );
    }

    await novoUser.save();
    return novoUser;
  }

  async completeRegister(completeRegister: CompleteUsuarioRegisterDto, invite: UsuarioEmpresaConvite) {
    const novoUser = new Usuario();
    novoUser.nome = completeRegister.nome;
    novoUser.email = completeRegister.email;
    novoUser.ativo = true;
    novoUser.verificado = true;
    novoUser.telefone = completeRegister.telefone;
    novoUser.idiomaPreferido = completeRegister.idiomaPreferido;
    novoUser.password = await bcrypt.hash(
      completeRegister.senha,
      await bcrypt.genSalt(),
    );
    await novoUser.save();
    await this.usuarioEmpresaService.linkAsInvite(novoUser, invite);
    return novoUser;
  }

  async createAndLinkCompany(novoUser: Usuario, companyToken: UserCompanyPayload) {
    const newUser = await this.create(novoUser);
    await this.usuarioEmpresaService.linkUserAndCompany(novoUser, companyToken);
    return newUser;
  }

  async changePassword(usuario: Usuario, novaSenha: string): Promise<Usuario> {
    usuario.password = await bcrypt.hash(novaSenha, await bcrypt.genSalt());
    return usuario.save();
  }

  async verifyUser(usuario: Usuario): Promise<Usuario> {
    usuario.verificado = true;
    return usuario.save();
  }

  findAll(where?: Partial<Usuario>) {
    return this.repoUser.findAll({
      where,
    });
  }

  findById(id: number, include?: Includeable[]) {
    return this.repoUser.findByPk(id, { include });
  }

  findOne(where: Partial<Usuario>): Promise<Usuario> {
    return this.repoUser.findOne({
      where: { ...where },
      include: [
        {
          model: UsuarioEmpresa,
          as: 'empresas',
          include: [Empresa, Role],
        },
      ],
    });
  }

  findByEmail(email: string): Promise<Usuario> {
    return this.findOne({ email });
  }

  async update(id: number, partialUser: Partial<Usuario>) {
    if (partialUser.password) {
      partialUser.password = await bcrypt.hash(
        partialUser.password,
        await bcrypt.genSalt(),
      );
    }
    return this.repoUser.findByPk(id)
      .then(user => user.update(partialUser));
  }

  remove(id: number) {
    return this.repoUser.findByPk(id)
      .then(async user => {
        await user.update({
          nome: `User #${user.id}`,
          email: `user.${user.id}@timerdoc.com.br`,
          telefone: null,
          ativo: false
        });
        await this.usuarioEmpresaService.deleteAllFromUser(new Usuario({ id }));
        return user;
      })
      .then(user => user.destroy());
  }

  async generateTokenBody(payload: any, extraData: any) {
    const { exp, iat, ...payloadFiltered } = payload;
    return {
      type: 'Bearer',
      access_token: await this.jwtService.signAsync(payloadFiltered),
      refresh_token: await this.jwtService.signAsync(payloadFiltered, { secret: jwtConstants.refreshSecret }),
      ...extraData,
    };
  }

  async comparePassword(email: string, pass: string): Promise<any> {
    const user = await this.findOne({ email });
    if (user) {
      if (!user.verificado) {
        throw GenericException.fromConstant(UserErrors.REGISTRO_PENDENTE_VERIFICACAO);
      }
      if ((await bcrypt.compare(pass, user.password)) && user.ativo) {
        const { password, ...result } = user.get();
        return result;
      } else throw GenericException.fromConstant(UserErrors.SENHAS_INFORMADAS_NAO_COINCIDEM);
    } else throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_ENCONTRADO);
  }

}
