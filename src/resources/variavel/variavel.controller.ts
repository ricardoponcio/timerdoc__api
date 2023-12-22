import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { VariableErrors } from '@app/core/constants/definition/errors/9xx.variable.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { Body, Controller, Param, Get, Post, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { CreateVariavelDto } from './dto/create-variavel.dto';
import { NivelAtributoEnum, Variavel } from './entities/variavel.entity';
import { VariavelService } from './variavel.service';
import { UpdateVariavelDto } from './dto/update-variavel.dto';

@ApiTags('Variables') @ApiExtraModels(Variavel)
@ApiBearerAuth()
@Controller('/variables')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class VariavelController {

    constructor(private readonly variavelService: VariavelService) { }

    @ApiBody({ type: CreateVariavelDto, description: 'Objeto com dados para criação da variável do nível desejado' })
    @ApiOkResponse({ description: 'Registro de variável criado', type: Variavel })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/new')
    @Roles(RolesEnum.USUARIO)
    async create(@MyCompany() user: UserCompanyPayload, @Body() createVariavelDto: CreateVariavelDto) {
        if (createVariavelDto.nivel === NivelAtributoEnum.DOCUMENTO && !createVariavelDto.documentoGeralId) {
            throw GenericException.fromConstant(VariableErrors.NIVEL_INFORMADO_REQUER_MAIS_ATRIBUTOS, ['documentoGeralId']);
        }

        const criado = await this.variavelService.createVariable(user, createVariavelDto);
        return instanceToPlain(criado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiOkResponse({ type: Variavel, isArray: true, description: 'Variáveis cadastradas na empresa logada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/list')
    @Roles(RolesEnum.VISUALIZADOR)
    async findAll(@MyCompany() user: UserCompanyPayload) {
        const variaveis = await this.variavelService.findVariablesFromCompany(user);
        return instanceToPlain(variaveis, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'id', type: Number, description: 'ID da Variável que será atualizado' })
    @ApiBody({ type: UpdateVariavelDto, description: 'Patch dos dados que será atualizado na Variável' })
    @ApiOkResponse({ type: Variavel, description: 'Variável atualizado' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Patch('/:id/update')
    @Roles(RolesEnum.USUARIO)
    async update(@MyCompany() user: UserCompanyPayload, @Param('id') id: number, @Body() updateVariavelDto: UpdateVariavelDto) {
        const existente = await this.variavelService.findFormFromCompanyAndId(id, user);
        if (!existente) {
            throw GenericException.fromConstant(VariableErrors.REGISTRO_NAO_PERTENCE_A_EMPRESA);
        }

        await this.variavelService.update(id, updateVariavelDto);
        const atualizado = await this.variavelService.findFormFromCompanyAndId(id, user);
        return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'id', type: Number, description: 'ID da Variável que será removido' })
    @ApiOkResponse({ description: 'Variável removido' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Delete('/:id/remove')
    @Roles(RolesEnum.GESTOR)
    async remove(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
        const existente = await this.variavelService.findFormFromCompanyAndId(id, user);
        if (!existente) {
            throw GenericException.fromConstant(VariableErrors.REGISTRO_NAO_PERTENCE_A_EMPRESA);
        }

        await this.variavelService.remove(id);
    }

}
