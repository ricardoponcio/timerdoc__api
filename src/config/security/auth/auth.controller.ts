import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { InviteErrors } from '@app/core/constants/definition/errors/7xx.invite.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { StatusAceiteEnum } from '@app/resources/shared/usuario-empresa/entities/usuario-empresa-convite.entity';
import { UsuarioEmpresaConviteService } from '@app/resources/shared/usuario-empresa/usuario-empresa-convite.service';
import { CompleteUsuarioRegisterDto } from '@app/resources/shared/usuarios/dto/complete-usuario-register.dto';
import { ReadSimpleUser } from '@app/resources/shared/usuarios/dto/read-simple-usuario.dto';
import { TipoHashEnum } from '@app/resources/shared/usuarios/entities/usuario-hash-recuperacao';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { UsuariosHashRecuperacaoService } from '@app/resources/shared/usuarios/usuarios-hash-recuperacao.service';
import { UsuariosService } from '@app/resources/shared/usuarios/usuarios.service';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@security/auth.service';
import { LocalAuthGuard } from '@security/local-auth.guard';
import { LoginResponseDto } from '@security/login-response.dto';
import { LoginDto } from '@security/login.dto';
import { RecoverPasswordDto } from '@security/recover-password.dto';
import { RegisterDto } from '@security/register.dto';
import { VerifyDto } from '@security/verify.dto';
import { ReadUsuarioWithoutCompanyDto } from '@shared/usuarios/dto/read-usuario-wo-company.dto';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { InformacaoDestinatario } from 'src/resources/email/dto/envio-emails-informacoes.dto';
import { EmailService } from 'src/resources/email/email.service';
import { CheckEmailRecordDto } from './check-email-record.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
    private readonly usuariosService: UsuariosService,
    private readonly usuarioHashRecuperacaoService: UsuariosHashRecuperacaoService,
    private readonly usuarioEmpresaConviteService: UsuarioEmpresaConviteService
  ) { }

  @ApiBody({ type: CheckEmailRecordDto, description: "Objeto com email para consulta" })
  @ApiOkResponse({ type: ReadSimpleUser, description: 'Registro do usuário se encontrado, vazio se não.' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @ApiBody({ type: CheckEmailRecordDto })
  @Post('/check-exists')
  @HttpCode(HttpStatus.OK)
  async emailExisteNaBase(@Body() checkEmail: CheckEmailRecordDto) {
    const existente = await this.authService.findByEmail(
      checkEmail.email,
    );
    if (!existente)
      throw GenericException.fromConstant(UserErrors.EMAIL_NAO_EXISTE);

    return plainToClass(ReadSimpleUser, instanceToPlain(existente, { excludeExtraneousValues: true }));
  }

  @ApiBody({ type: LoginDto, description: "Objeto com email e senha para autenticação" })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Retorno com token de acesso' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: any) {
    /*
        TODO: deixar mais generico, sem depender explicitamento do Express
        atualmente o req é o tipo requisição do Express 
        */
    const userJwt = await this.authService.login(req.user);
    return instanceToPlain(userJwt, { excludeExtraneousValues: true });
  }

  // @ApiHeader({ name: 'Authorization' })
  // @ApiOkResponse({ type: LoginResponseDto, description: 'Retorno com token de acesso recuperado' })
  // @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  // @Post('/refresh')
  // @HttpCode(HttpStatus.OK)
  // async refresh(@Header('authorization') refreshTokenBearer: string) {
  //   return await this.authService.relogin((refreshTokenBearer || '').replaceAll('Bearer ', ''));
  // }

  @ApiBody({ type: RegisterDto, description: "Objeto com dados base do registro pré-ativação" })
  @ApiOkResponse({ type: LoginResponseDto, description: 'Registro da inserção do novo usuário' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async registro(@Body() registro: RegisterDto) {
    const existente = await this.authService.checkAlreadyCreated(
      registro.email,
    );
    if (existente)
      throw GenericException.fromConstant(UserErrors.EMAIL_JA_EXISTE);

    const newUser = await this.authService.createNewUser(registro);
    const hash = await this.usuarioHashRecuperacaoService.create(newUser, TipoHashEnum.REGISTER);

    const emailInfo = new InformacaoDestinatario(newUser.email, newUser.nome, hash.hashRecuperacao);
    this.emailService.sendNewUserEmail(emailInfo);

    return instanceToPlain(newUser, {
      excludeExtraneousValues: true,
      targetMaps: [
        { target: () => ReadUsuarioWithoutCompanyDto, properties: {} },
      ],
    });
  }

  @ApiBody({ type: VerifyDto, description: "Nova senha e confirmação para ativação do usuário" })
  @ApiParam({ name: 'hashRecuperacao', type: String, description: "Hash enviado para o email para identificação do pedido de registro" })
  @ApiOkResponse({ type: ReadUsuarioWithoutCompanyDto, description: 'Registro do usuário recém ativado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/verify/:hashRecuperacao')
  @HttpCode(HttpStatus.OK)
  async verificacao(@Body() verificacao: VerifyDto, @Param('hashRecuperacao') hashRecuperacao: string) {
    const existente = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.REGISTER);
    if (!existente)
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);
    if (verificacao.senha !== verificacao.senhaConfirmacao)
      throw GenericException.fromConstant(UserErrors.SENHAS_INFORMADAS_NAO_COINCIDEM);

    const usuarioValidado = await this.authService.verifyUser(existente.usuario);
    const usuarioSenhAlterada = await this.authService.changePassword(usuarioValidado, verificacao.senha);
    await this.usuarioHashRecuperacaoService.utilizarHash(hashRecuperacao);

    return instanceToPlain(usuarioSenhAlterada, {
      excludeExtraneousValues: true,
      targetMaps: [
        { target: () => ReadUsuarioWithoutCompanyDto, properties: {} },
      ],
    });
  }

  @ApiBody({ type: RecoverPasswordDto, description: "Objeto com o email para recuperação de senha" })
  @ApiOkResponse({ description: 'Registro do Hash criado e enviado para o Email' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/recover-password')
  @HttpCode(HttpStatus.OK)
  async recuperacaoSenha(@Body() recoverPassword: RecoverPasswordDto) {
    const existente = await this.authService.checkAlreadyCreated(
      recoverPassword.email,
    );
    if (!existente)
      throw GenericException.fromConstant(UserErrors.EMAIL_NAO_EXISTE);

    const hash = await this.usuarioHashRecuperacaoService.create(existente, TipoHashEnum.RECOVER);

    const emailInfo = new InformacaoDestinatario(existente.email, existente.nome, hash.hashRecuperacao);
    this.emailService.sendNewPasswordEmail(emailInfo);

    return instanceToPlain(hash, {
      excludeExtraneousValues: true,
      targetMaps: [
        { target: () => ReadUsuarioWithoutCompanyDto, properties: {} },
      ],
    });
  }

  @ApiBody({ type: VerifyDto, description: 'Objeto com senha e confirmação de senha para a recuperação do acesso' })
  @ApiOkResponse({ type: ReadUsuarioWithoutCompanyDto, description: 'Registro do usuário que teve senha recém alterada' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/recover-password/:hashRecuperacao')
  @HttpCode(HttpStatus.OK)
  async recuperarASenha(@Body() verificacao: VerifyDto, @Param('hashRecuperacao') hashRecuperacao: string) {
    const existente = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.RECOVER);
    if (!existente)
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);
    if (verificacao.senha !== verificacao.senhaConfirmacao)
      throw GenericException.fromConstant(UserErrors.SENHAS_INFORMADAS_NAO_COINCIDEM);

    const usuario = await this.authService.changePassword(existente.usuario, verificacao.senha);
    await this.usuarioHashRecuperacaoService.utilizarHash(hashRecuperacao);

    return instanceToPlain(usuario, {
      excludeExtraneousValues: true,
      targetMaps: [
        { target: () => ReadUsuarioWithoutCompanyDto, properties: {} },
      ],
    });
  }

  @ApiParam({ name: 'hashRecuperacao', type: String, description: 'Hash de Recuperação do convite enviado para o email' })
  @ApiBody({ type: CompleteUsuarioRegisterDto, description: 'Objeto para preencher registro de novo usário a partir de convite' })
  @ApiOkResponse({ description: 'Usuario Vinculado', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/complete-register/:hashRecuperacao')
  async completeRegister(@Body() completeUsuarioRegisterDto: CompleteUsuarioRegisterDto, @Param('hashRecuperacao') hashRecuperacao: string) {
    const hash = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.INVITE);
    if (!hash)
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);

    const existente = await this.authService.checkAlreadyCreated(
      completeUsuarioRegisterDto.email,
    );
    if (existente)
      throw GenericException.fromConstant(UserErrors.EMAIL_JA_EXISTE);
    if (completeUsuarioRegisterDto.senha !== completeUsuarioRegisterDto.senhaConfirmacao)
      throw GenericException.fromConstant(UserErrors.SENHAS_INFORMADAS_NAO_COINCIDEM);

    const convite = await this.usuarioEmpresaConviteService.buscarConvite(hash.usuarioEmpresaConviteId);
    if (!convite) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }
    if (completeUsuarioRegisterDto.email !== convite.emailConvidado) {
      throw GenericException.fromConstant(InviteErrors.EMAIL_CADASTRO_E_CONVITE_DIVERGEM);
    }

    const newUser = await this.usuariosService.completeRegister(completeUsuarioRegisterDto, convite);
    await this.usuarioEmpresaConviteService.usarConvite(convite, StatusAceiteEnum.ACEITO, newUser);

    return instanceToPlain(newUser, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

}
