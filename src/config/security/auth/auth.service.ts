import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { EmpresasService } from '@app/resources/shared/empresas/empresas.service';
import { UsuarioEmpresaService } from '@app/resources/shared/usuario-empresa/usuario-empresa.service';
import { TokenUtils } from '@app/utils/token.utils';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from '@security/register.dto';
import { Usuario } from 'src/resources/shared/usuarios/entities/usuario.entity';
import { UsuariosService } from 'src/resources/shared/usuarios/usuarios.service';
import { jwtConstants } from './constants';
import { UserCompanyPayload } from './user-company.payload.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsuariosService,
    private empresaService: EmpresasService,
    private userCompanyService: UsuarioEmpresaService,
    private jwtService: JwtService
  ) { }
  //TODO: adicionar critografica unidirecional
  async validateUser(mail: string, pass: string): Promise<any> {
    try {
      return await this.userService.comparePassword(mail, pass);
    } catch (err) {
      if (err?.response?.errorCode === UserErrors.REGISTRO_PENDENTE_VERIFICACAO.id) throw err;
    }
    return null;
  }

  async login(user: Usuario) {
    return this.userService.generateTokenBody(TokenUtils.buildUserPayload(user),
      TokenUtils.convertUserSecureValue(await this.userService.findById(user.id)));
  }

  async relogin(refreshToken: string) {
    if (!refreshToken) throw new NotFoundException('Usuário não encontrado');
    const payload = <UserCompanyPayload>this.jwtService.decode(refreshToken);
    if (!payload) throw new NotFoundException('Usuário não encontrado');
    if (!payload.email) throw new NotFoundException('Usuário não encontrado');
    const usuario = await this.userService.findOne({ email: payload.email });
    if (!usuario || usuario.id !== payload.id) throw new NotFoundException('Usuário não encontrado');

    let company = null;
    if (payload.sub?.empresaId) {
      company = await this.userCompanyService.findByEmpresaIdAndUserId(usuario.id, payload.sub.empresaId);
      if (!company || company.length === 0) throw new NotFoundException('Relação Usuário<>Empresa não encontrada');
      company = await this.empresaService.findById(payload.sub.empresaId);
    }

    try {
      try {
        this.jwtService.verify(refreshToken, {
          secret: jwtConstants.refreshSecret,
        });
      } catch (err) {
        // Tudo bem se expirou, vamos gerar outro né???
        // if (err.name !== 'TokenExpiredError') throw err;
        throw err;
      }
      return this.userService.generateTokenBody(payload, !company ?
        TokenUtils.convertUserSecureValue(await this.userService.findById(usuario.id)) :
        TokenUtils.convertCompanySecureValue(company));
    } catch (err) {
      if (err.name === 'JsonWebTokenError') throw new UnauthorizedException('Assinatura Inválida');
      // if (err.name === 'TokenExpiredError') throw new UnauthorizedException('Token Expirado');
      throw new UnauthorizedException(err.name);
    }
  }

  createNewUser(register: RegisterDto) {
    return this.userService.create(register.toUsuario());
  }

  changePassword(usuario: Usuario, novaSenha: string): Promise<Usuario> {
    return this.userService.changePassword(usuario, novaSenha);
  }

  async verifyUser(usuario: Usuario): Promise<Usuario> {
    return this.userService.verifyUser(usuario);
  }

  checkAlreadyCreated(email: string) {
    return this.userService.findOne({ email });
  }

  findByEmail(email: string): Promise<Usuario> {
    return this.userService.findByEmail(email);
  }
}
