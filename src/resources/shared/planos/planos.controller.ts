import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Plano } from '@shared/planos/plano.entity';
import { PlanosService } from '@shared/planos/planos.service';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';

@ApiTags('Plans') @ApiExtraModels(Plano)
@ApiBearerAuth()
@Controller('plans')
@UseGuards(JwtCompanyAuthGuard)
export class PlanosController {
  constructor(private readonly planosService: PlanosService) { }

  @ApiOkResponse({ type: Plano, isArray: true, description: 'Retorno com planos' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get()
  async findAll() {
    const planos = await this.planosService.findAll();
    return instanceToPlain(planos, { enableCircularCheck: false, excludeExtraneousValues: true })
  }
}
