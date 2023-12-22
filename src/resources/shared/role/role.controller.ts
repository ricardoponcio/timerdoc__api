import { JwtAuthGuard } from '@app/config/security/auth/jwt-auth.guard';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { Role } from './entity/role.entity';
import { RoleService } from './role.service';

@ApiTags('Roles') @ApiExtraModels(Role)
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private readonly rolesService: RoleService) { }

  @ApiOkResponse({ type: Role, isArray: true, description: 'Retorno com roles ativas' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/list')
  async findAll() {
    const roles = await this.rolesService.findAll();
    return instanceToPlain(roles, { enableCircularCheck: false, excludeExtraneousValues: true })
  }
}
