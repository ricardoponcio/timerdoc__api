import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { CompanyErrors } from '@app/core/constants/definition/errors/6xx.company.errors';
import { MyUser } from '@app/core/decorators/my-user.decorator';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateEmpresaDto } from '@shared/empresas/dto/create-empresa.dto';
import { UpdateEmpresaDto } from '@shared/empresas/dto/update-empresa.dto';
import { EmpresasService } from '@shared/empresas/empresas.service';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { UsuariosService } from '@shared/usuarios/usuarios.service';
import { instanceToPlain } from 'class-transformer';
import { JwtAuthGuard } from 'src/config/security/auth/jwt-auth.guard';
import { LoginResponseDto } from 'src/config/security/auth/login-response.dto';
import { UserPayload } from 'src/config/security/auth/user.payload.dto';
import { NestResponseBuilder } from 'src/core/http/nest-response-builder';
const _ = require('lodash');

@ApiTags('Company') @ApiExtraModels(Empresa)
@ApiBearerAuth()
@Controller('/company')
@UseGuards(JwtAuthGuard)
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly userService: UsuariosService
  ) { }

  @ApiBody({ type: CreateEmpresaDto, description: 'Objeto com dados da empresa para criação do registro' })
  @ApiOkResponse({ description: 'Registro de empresa Criado', type: Empresa })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Post('/new')
  async create(@MyUser() user: UserPayload, @Body() empresaNova: CreateEmpresaDto) {
    if (await this.empresasService.findByCpnj(empresaNova.cnpj))
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_JA_EXISTE);

    const empresa = await this.empresasService.createAndLinkUser(empresaNova.toEmpresa(), user);
    return new NestResponseBuilder()
      .setHeaders({ 'Location': `/empresas/${empresa.id}` })
      .setBody(instanceToPlain(empresa, { enableCircularCheck: false, excludeExtraneousValues: true }))
      .build();
  }

  @ApiOkResponse({ type: Empresa, isArray: true, description: 'Lista de empresas cadastradas para o usuário' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/list')
  async findAll(@MyUser() user: UserPayload) {
    const usuarioLogado = await this.userService.findOne({ id: user.id });
    return instanceToPlain(usuarioLogado.empresas, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID da empresa para ser detalhada' })
  @ApiOkResponse({ type: Empresa, description: 'Registro da empresa encontrada detalhado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:id/detail')
  async findOne(@MyUser() user: UserPayload, @Param('id') id: number) {
    const ue = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, id)
    if (!ue || ue.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    return instanceToPlain(ue.map(uef => uef.empresa)[0],
      { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'cnpj', type: String, description: 'CNPJ da empresa que deseja-se buscar' })
  @ApiOkResponse({ type: Empresa, description: 'Registro da empresa encontrada para o documento informado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/cnpj/:cnpj/detail/')
  async findOneByDc(@MyUser() user: UserPayload, @Param('cnpj') cnpj: string) {
    if (!cnpj.match(/\d{14}/)) {
      throw GenericException.fromConstant(CompanyErrors.DOC_FORMATO_INVALIDO);
    }

    const ue = await this.usuarioEmpresaService.findByEmpresaDocAndUserId(user.id, cnpj)
    if (!ue || ue.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    return instanceToPlain(ue.map(uef => uef.empresa)[0],
      { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID da empresa para ser atualizada' })
  @ApiBody({ type: UpdateEmpresaDto, description: 'Objeto com dados para atualização do registro da empresa informada' })
  @ApiOkResponse({ type: Empresa, description: 'Registro da empresa atualizada' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Patch('/:id/update')
  async update(@Request() req: any, @Param('id') id: number, @Body() updateEmpresaDto: UpdateEmpresaDto) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId((<UserPayload>req.user).id, id)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    await this.empresasService.update(id, updateEmpresaDto);
    return instanceToPlain(await this.empresasService.findById(id),
      { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID da empresa para ser removida do cadastro' })
  @ApiOkResponse({ description: 'Registro removido com sucesso' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Delete('/:id/remove')
  async remove(@MyUser() user: UserCompanyPayload, @Param('id') id: number) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, id)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    await this.empresasService.remove(id, user);
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID da empresa escolhida pra ganhar novo token e se logar' })
  @ApiOkResponse({ description: 'Novo token com empresa vinculada', type: LoginResponseDto })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:id/select')
  async select(@MyUser() user: UserCompanyPayload, @Param('id') id: number) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, id)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    return this.empresasService.loginWithCompany(id, user)
  }

}
