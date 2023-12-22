import { MinIOService } from '@storage/storage.service';
import { JwtCompanyAuthGuard } from '@app/config/security/auth/jwt-company-auth.guard';
import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { CompanyErrors } from '@app/core/constants/definition/errors/6xx.company.errors';
import { MyUser } from '@app/core/decorators/my-user.decorator';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { EmpresasService } from './empresas.service';
const _ = require('lodash');

@ApiTags('Company') @ApiExtraModels(Empresa)
@ApiBearerAuth()
@Controller('/logged-company')
@UseGuards(JwtCompanyAuthGuard)
export class EmpresaController {
  constructor(
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly empresaService: EmpresasService,
    private readonly minioService: MinIOService
  ) { }

  @ApiOkResponse({ description: 'Dado de armazenamento utilizado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/storage-used')
  async getStorageUsed(@MyUser() user: UserCompanyPayload) {
    const usuario = await this.usuarioEmpresaService.findByEmpresaIdAndUserId(user.id, user.sub.empresaId)
    if (!usuario || usuario.length === 0)
      throw GenericException.fromConstant(CompanyErrors.REGISTRO_NAO_PERTENCE_USUARIO);
    const storageUsed = await this.minioService.searchStorageUsedFromOrigin(new Empresa({ id: user.sub.empresaId }));
    const maxStorage = await this.empresaService.maxUploadMBStoragePerCompany(user);
    const maxStorageB = maxStorage * 1024 * 1024;
    return {
      used: storageUsed,
      usedMetric: 'B',
      maxUsage: maxStorageB,
      maxUsageMetric: 'B',
      usage: ((storageUsed / maxStorageB) * 100).toFixed(2) + "%"
    }
  }

}
