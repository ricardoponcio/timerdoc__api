import { JwtAuthGuard } from '@app/config/security/auth/jwt-auth.guard';
import { UserPayload } from '@app/config/security/auth/user.payload.dto';
import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { CompanyErrors } from '@app/core/constants/definition/errors/6xx.company.errors';
import { InviteErrors } from '@app/core/constants/definition/errors/7xx.invite.errors';
import { MyUser } from '@app/core/decorators/my-user.decorator';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { InformacaoDestinatario } from '@app/resources/email/dto/envio-emails-informacoes.dto';
import { EmailService } from '@app/resources/email/email.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { UsuariosService } from '@shared/usuarios/usuarios.service';
import { instanceToPlain } from 'class-transformer';
import { StatusAceiteEnum, UsuarioEmpresaConvite } from '../usuario-empresa/entities/usuario-empresa-convite.entity';
import { UsuarioEmpresaConviteService } from '../usuario-empresa/usuario-empresa-convite.service';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ReadUsuarioWithoutCompanyDto } from './dto/read-usuario-wo-company.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { TipoHashEnum } from './entities/usuario-hash-recuperacao';
import { UsuariosHashRecuperacaoService } from './usuarios-hash-recuperacao.service';

@ApiTags('Logged User') @ApiExtraModels(Usuario)
@ApiBearerAuth()
@Controller('/user')
@UseGuards(JwtAuthGuard)
export class UsuarioController {
  constructor(
    private readonly emailService: EmailService,
    private readonly usuariosService: UsuariosService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly usuarioEmpresaConviteService: UsuarioEmpresaConviteService,
    private readonly usuarioHashRecuperacaoService: UsuariosHashRecuperacaoService) { }

  @ApiOkResponse({ description: 'Detalhamento do usuário logado', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/info')
  async loggedUser(@MyUser() user: UserPayload) {
    const usuario = await this.usuariosService.findById(user.id);
    return instanceToPlain(usuario, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário que será removido (deve ser o mesmo do logado)' })
  @ApiOkResponse({ description: 'Usuário desativado com sucesso' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Delete('/:id/remove')
  async removeMyself(@MyUser() user: UserPayload, @Param('id') id: number) {
    if (user.id !== id) {
      throw GenericException.fromConstant(UserErrors.ACAO_PROIBIDA);
    }

    const existente = await this.usuariosService.findById(user.id);
    if (!existente)
      throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_ENCONTRADO);
    // const hashExistente = await this.usuarioHashRecuperacaoService.findOpenHash(existente, TipoHashEnum.DELETE_ACCOUNT);
    // if (hashExistente)
    //   throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_JA_EXISTE_NA_BASE);

    const hash = await this.usuarioHashRecuperacaoService.create(existente, TipoHashEnum.DELETE_ACCOUNT);
    const emailInfo = new InformacaoDestinatario(existente.email, existente.nome, hash.hashRecuperacao);
    this.emailService.sendDeleteAccountEmail(emailInfo);

    return instanceToPlain(hash, {
      excludeExtraneousValues: true,
      targetMaps: [
        { target: () => ReadUsuarioWithoutCompanyDto, properties: {} },
      ],
    });
    // return this.usuariosService.remove(id);
  }

  @ApiBody({ type: DeleteAccountDto, description: 'Objeto com dados de confirmação do usuário' })
  @ApiParam({ name: 'hashRecuperacao', type: String, description: 'Hash de Recuperação enviado para o email para aceitar o convite' })
  @ApiOkResponse({ description: 'Confirmação da Exclusão da Conta', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/remove/:hashRecuperacao/verify')
  async confirmRemoveMyself(@MyUser() user: UserPayload, @Param('hashRecuperacao') hashRecuperacao: string, @Body() deleteAccountDto: DeleteAccountDto) {
    const hash = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.DELETE_ACCOUNT);
    if (!hash)
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);
    if (!hash.usuario)
      throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_ENCONTRADO);

    await this.usuariosService.comparePassword(hash.usuario.email, deleteAccountDto.senha);
    await this.usuariosService.remove(hash.usuario.id);
    await this.usuarioHashRecuperacaoService.utilizarHash(hash.hashRecuperacao);
  }


  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário que será atualizado (deve ser o mesmo do logado)' })
  @ApiBody({ type: UpdateUsuarioDto, description: 'Objeto com atributos para serem atualizados no usuário' })
  @ApiOkResponse({ type: Usuario, description: 'Retorno com usuario atualizado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Patch('/:id/update')
  async updateMyself(@MyUser() user: UserPayload, @Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    if (user.id !== id) {
      throw GenericException.fromConstant(UserErrors.ACAO_PROIBIDA);
    }

    if (updateUsuarioDto.senha) {
      if (updateUsuarioDto.senha !== updateUsuarioDto.senhaConfirmacao) {
        throw GenericException.fromConstant(UserErrors.SENHAS_INFORMADAS_NAO_COINCIDEM);
      }
    }

    await this.usuariosService.update(id, { ...updateUsuarioDto, password: updateUsuarioDto.senha });
    const atualizado = await this.usuariosService.findById(id);
    return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true })
  }

  @ApiParam({ name: 'hashRecuperacao', type: String, description: 'Hash de Recuperação enviado para o email para aceitar o convite' })
  @ApiOkResponse({ description: 'Registro do usuário vinculado', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/accept-invite/:hashRecuperacao/byHash')
  async acceptInvite(@MyUser() user: UserPayload, @Param('hashRecuperacao') hashRecuperacao: string) {
    const hash = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.INVITE);
    if (!hash)
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);

    const convite = await this.usuarioEmpresaConviteService.buscarConvite(hash.usuarioEmpresaConviteId);
    if (!convite) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }

    const usuarioLogado = await this.usuariosService.findById(user.id);
    if (convite.usuarioCriadoId !== user.id && convite.emailConvidado !== usuarioLogado.email) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_ENVIADO_PARA_OUTRO_USUARIO);
    }

    const usuarioJaCriado = convite.usuarioCriadoId ? await this.usuariosService.findById(convite.usuarioCriadoId) : null;
    if (!usuarioJaCriado) {
      throw GenericException.fromConstant(UserErrors.PRECISA_CONCLUIR_REGISTRO);
    }
    await this.usuarioEmpresaService.linkAsInvite(usuarioJaCriado, convite);
    await this.usuarioEmpresaConviteService.usarConviteUsuarioJaCriado(convite, StatusAceiteEnum.ACEITO);

    return instanceToPlain(usuarioJaCriado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'inviteId', type: String, description: 'ID do invite para aceitação pelo usuário logado' })
  @ApiOkResponse({ description: 'Registro do usuário vinculado', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/accept-invite/:inviteId')
  async acceptInviteLogged(@MyUser() user: UserPayload, @Param('inviteId') inviteId: number) {
    const convite = await this.usuarioEmpresaConviteService.buscarConvite(inviteId);
    if (!convite) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }

    const usuarioLogado = await this.usuariosService.findById(user.id);
    if (convite.usuarioCriadoId !== user.id && convite.emailConvidado !== usuarioLogado.email) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_ENVIADO_PARA_OUTRO_USUARIO);
    }

    await this.usuarioEmpresaService.linkAsInvite(usuarioLogado, convite);
    await this.usuarioEmpresaConviteService.usarConviteUsuarioJaCriado(convite, StatusAceiteEnum.ACEITO);

    return instanceToPlain(usuarioLogado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'inviteId', type: String, description: 'ID do invite para recusa pelo usuário logado' })
  @ApiOkResponse({ description: 'Registro do usuário atual', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/decline-invite/:inviteId')
  async declineInviteLogged(@MyUser() user: UserPayload, @Param('inviteId') inviteId: number) {
    const convite = await this.usuarioEmpresaConviteService.buscarConvite(inviteId);
    if (!convite) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }

    const usuarioLogado = await this.usuariosService.findById(user.id);
    if (convite.usuarioCriadoId !== user.id && convite.emailConvidado !== usuarioLogado.email) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_ENVIADO_PARA_OUTRO_USUARIO);
    }

    await this.usuarioEmpresaConviteService.usarConviteUsuarioJaCriado(convite, StatusAceiteEnum.RECUSADO);

    return instanceToPlain(usuarioLogado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiOkResponse({ type: UsuarioEmpresaConvite, isArray: true, description: 'Retorno com convites abertos para o usuário avaliar' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/open-invites/list')
  async findAllOpenInvites(@MyUser() user: UserPayload) {
    const convites = await this.usuarioEmpresaConviteService.buscarConvitesAbertosDoUsuario(user);
    return instanceToPlain(convites, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'companyId', type: String, description: 'Empresa que deseja-se desfazer relação' })
  @ApiOkResponse({ description: 'Registro do usuário com vínculo removido', type: Usuario })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/abandon-relation/:companyId')
  async abandonRelation(@MyUser() user: UserPayload, @Param('companyId') companyId: number) {
    const ue = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, companyId);
    if (!ue || ue.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    await this.usuarioEmpresaService.deleteFromUser(user, companyId);
  }

}
