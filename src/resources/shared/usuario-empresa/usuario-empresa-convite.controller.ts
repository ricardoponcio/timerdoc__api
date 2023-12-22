import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { InviteErrors } from '@app/core/constants/definition/errors/7xx.invite.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { TipoHashEnum } from '../usuarios/entities/usuario-hash-recuperacao';
import { UsuariosHashRecuperacaoService } from '../usuarios/usuarios-hash-recuperacao.service';
import { UsuarioEmpresaConvite } from './entities/usuario-empresa-convite.entity';

@ApiTags('Users Invite') @ApiExtraModels(UsuarioEmpresaConvite)
@ApiBearerAuth()
@Controller('/users-invite')
export class UsuarioEmpresaConviteController {
  constructor(
    private readonly usuarioHashRecuperacaoService: UsuariosHashRecuperacaoService) { }

  @ApiParam({ name: 'hash', type: String, description: 'Hash para recuperação do convite enviado para o email' })
  @ApiOkResponse({ type: UsuarioEmpresaConvite, description: 'Dados do convite' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:hash/detail')
  async findInvite(@Param('hash') hashRecuperacao: string) {
    const existente = await this.usuarioHashRecuperacaoService.recover(hashRecuperacao, TipoHashEnum.INVITE);
    if (!existente) {
      throw GenericException.fromConstant(UserErrors.HASH_INFORMADO_NAO_EXISTE);
    }
    if (!existente.usuarioEmpresaConvite || existente.usuarioEmpresaConvite.status !== null) {
      throw GenericException.fromConstant(InviteErrors.CONVITE_USUARIO_EMPRESA_JA_UTILIZADO);
    }
    return instanceToPlain(existente.usuarioEmpresaConvite, { excludeExtraneousValues: true });
  }

}
