import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { InviteErrors } from '@app/core/constants/definition/errors/7xx.invite.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { CreateUsuarioDto } from '@shared/usuarios/dto/create-usuario.dto';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { UsuariosService } from '@shared/usuarios/usuarios.service';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';
import { EmpresasService } from '../empresas/empresas.service';
import { RolesEnum } from '../role/entity/role.entity';
import { UsuarioEmpresaConvite } from '../usuario-empresa/entities/usuario-empresa-convite.entity';
import { UsuarioEmpresa } from '../usuario-empresa/entities/usuario-empresa.entity';
import { UsuarioEmpresaConviteService } from '../usuario-empresa/usuario-empresa-convite.service';
import { UpdateRoleUsuarioDto } from './dto/update-role-usuario.dto';
import { UsuariosHashRecuperacaoService } from './usuarios-hash-recuperacao.service';

@ApiTags('Users') @ApiExtraModels(Usuario)
@ApiBearerAuth()
@Controller('/users')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly empresaService: EmpresasService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly usuarioEmpresaConviteService: UsuarioEmpresaConviteService,
    private readonly usuarioHashRecuperacaoService: UsuariosHashRecuperacaoService) { }

  @ApiBody({ type: CreateUsuarioDto, description: 'Objeto com dados do usuario que receberá convite' })
  @ApiOkResponse({ description: 'Registro de convite feito', type: UsuarioEmpresaConvite })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/new')
  @Roles(RolesEnum.USUARIO)
  async create(@MyCompany() user: UserCompanyPayload, @Body() createUsuarioDto: CreateUsuarioDto) {
    const existente = await this.usuariosService.findByEmail(createUsuarioDto.email);
    if (existente) {
      const ue = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(existente.id, user.sub.empresaId);
      if (ue && ue.length > 0) {
        throw GenericException.fromConstant(UserErrors.REGISTRO_JA_EXISTE_NA_EMPRESA_SOLICITADA);
      }
    }

    const empresaLogada = await this.empresaService.findById(user.sub.empresaId);
    const conviteExistente = await this.usuarioEmpresaConviteService.buscarConviteAberto(createUsuarioDto.email, empresaLogada);
    if (conviteExistente) {
      throw GenericException.fromConstant(UserErrors.JA_TEM_CONVITE_FEITO);
    }

    const usuarioLogado = await this.usuariosService.findById(user.id);
    const invite = await this.usuarioEmpresaConviteService.doAInvite(usuarioLogado, empresaLogada, createUsuarioDto.roleName,
      { nome: createUsuarioDto.nome, email: createUsuarioDto.email, usuarioExistente: existente });
    return instanceToPlain(invite, { excludeExtraneousValues: true });
  }

  @ApiOkResponse({ type: Usuario, isArray: true, description: 'Lista de usuarios cadastrados' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/list')
  async findAll(@MyCompany() user: UserCompanyPayload) {
    const usuariosEmpresa = await this.usuarioEmpresaService.findByEmpresaId(user.sub.empresaId);
    return instanceToPlain(usuariosEmpresa, { enableCircularCheck: false, excludeExtraneousValues: true })
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário para detalhamento' })
  @ApiOkResponse({ type: Usuario, description: 'Registro do usuário encontrado detalhado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:id/detail')
  @Roles(RolesEnum.USUARIO)
  async findOne(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(id, user.sub.empresaId)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_PERTENCE_EMPRESA);
    return instanceToPlain(usuario.map(ue => ue.usuario)[0], { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário para atualizar relacionamento Usuario<>Empresa' })
  @ApiBody({ type: UpdateRoleUsuarioDto, description: 'Objeto com dados do relacionamento para atualização' })
  @ApiOkResponse({ type: UsuarioEmpresa, description: 'Vínculo de Usuario<>Empresa atualizado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Patch('/:id/update')
  @Roles(RolesEnum.GESTOR)
  async update(@MyCompany() user: UserCompanyPayload, @Param('id') id: number, @Body() updateRoleUsuarioDto: UpdateRoleUsuarioDto) {
    const logged = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, user.sub.empresaId)
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(id, user.sub.empresaId)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_PERTENCE_EMPRESA);
    else if (usuario.length !== 1)
      throw GenericException.fromConstant(UserErrors.REGISTRO_VINCULO_EMPRESA_NAO_INFORMADO);
    if ((await this.empresaService.compareRoles(logged.map(ue => ue.role), usuario[0].role)) <= 0)
      throw GenericException.fromConstant(UserErrors.PERFIL_NAO_PERMITE_GERENCIAR_USUARIO);
    if ((await this.empresaService.compareRoles(logged.map(ue => ue.role), updateRoleUsuarioDto.roleName)) < 0)
      throw GenericException.fromConstant(UserErrors.PERFIL_NAO_PERMITE_ALTERAR_PERFIL_MAIS_ALTO);
    await this.usuarioEmpresaService.changeRole(id, user.sub.empresaId, updateRoleUsuarioDto.roleName);
    const atualizado = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(id, user.sub.empresaId);

    return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true })
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do usuário para remover relacionamento Usuario<>Empresa' })
  @ApiOkResponse({ description: 'Remoção realizada com sucesso' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Delete('/:id/remove')
  @Roles(RolesEnum.ADM)
  async remove(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(id, user.sub.empresaId)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(UserErrors.REGISTRO_NAO_PERTENCE_EMPRESA);
    await this.usuarioEmpresaService.deleteFromCompany(user, id, user);
  }

  @ApiOkResponse({ type: UsuarioEmpresaConvite, isArray: true, description: 'Retorno com convites abertos' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/open-invites/list')
  async findAllOpenInvites(@MyCompany() user: UserCompanyPayload) {
    const empresaLogada = await this.empresaService.findById(user.sub.empresaId);
    const convites = await this.usuarioEmpresaConviteService.buscarConvitesAbertos(empresaLogada);
    return instanceToPlain(convites, { enableCircularCheck: false, excludeExtraneousValues: true })
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do convite aberto que deseja-se cancelar' })
  @ApiOkResponse({ description: 'Cancelamento realizado com sucesso' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Delete('/invite/:id/cancel')
  @Roles(RolesEnum.GESTOR)
  async cancelInvite(@MyCompany() user: UserCompanyPayload, @Param('id') inviteId: number) {
    const invite = await this.usuarioEmpresaConviteService.buscarConvite(inviteId);
    if (!invite) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }
    if (invite.empresaConviteId !== user.sub.empresaId) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_ENVIADO_DE_OUTRA_EMPRESA);
    }
    await this.usuarioEmpresaConviteService.comunicarEncerramentoRelacaoConvite(invite, user);
    await this.usuarioHashRecuperacaoService.findAndCancelHash(invite);
  }

}
