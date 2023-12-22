import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { FormErrors } from '@app/core/constants/definition/errors/10xx.form.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { DocumentoFormularioService } from './documento-formulario.service';
import { CreateDocumentoFormularioDto } from './dto/create-documento-formulario.dto';
import { UpdateDocumentoFormularioDto } from './dto/update-documento-formulario.dto';
import { DocumentoFormulario, NivelAtributoEnum } from './entities/documento-formulario.entity';

@ApiTags('Documents Forms') @ApiExtraModels(DocumentoFormulario)
@ApiBearerAuth()
@Controller('/document-forms')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class DocumentoFormularioController {

    constructor(private readonly documentoFormularioService: DocumentoFormularioService) { }

    @ApiBody({ type: CreateDocumentoFormularioDto, description: 'Objeto com dados para criação da Formulário de Documento do nível desejado' })
    @ApiOkResponse({ description: 'Registro de formulário criado', type: DocumentoFormulario })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/new')
    @Roles(RolesEnum.USUARIO)
    async create(@MyCompany() user: UserCompanyPayload, @Body() createFormularioDto: CreateDocumentoFormularioDto) {
        if (createFormularioDto.nivel === NivelAtributoEnum.DOCUMENTO && !createFormularioDto.documentoGeralId) {
            throw GenericException.fromConstant(FormErrors.NIVEL_INFORMADO_REQUER_MAIS_ATRIBUTOS, ['documentoGeralId']);
        }

        const criado = await this.documentoFormularioService.create(user, createFormularioDto);
        return instanceToPlain(criado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiOkResponse({ type: DocumentoFormulario, isArray: true, description: 'Formulários de Documentos cadastradas na empresa logada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/list')
    @Roles(RolesEnum.VISUALIZADOR)
    async findAll(@MyCompany() user: UserCompanyPayload) {
        const variaveis = await this.documentoFormularioService.findFormsFromCompany(user);
        return instanceToPlain(variaveis, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'id', type: Number, description: 'ID do Formulário que será atualizado' })
    @ApiBody({ type: UpdateDocumentoFormularioDto, description: 'Patch dos dados que será atualizado no registro do formulário' })
    @ApiOkResponse({ type: DocumentoFormulario, description: 'Formulário atualizado' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Patch('/:id/update')
    @Roles(RolesEnum.USUARIO)
    async update(@MyCompany() user: UserCompanyPayload, @Param('id') id: number, @Body() updateDocumentoFormularioDto: UpdateDocumentoFormularioDto) {
        const existente = await this.documentoFormularioService.findFormFromCompanyAndId(id, user);
        if (!existente) {
            throw GenericException.fromConstant(FormErrors.REGISTRO_NAO_PERTENCE_A_EMPRESA);
        }

        await this.documentoFormularioService.update(id, updateDocumentoFormularioDto);
        const atualizado = await this.documentoFormularioService.findFormFromCompanyAndId(id, user);
        return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'id', type: Number, description: 'ID do formulário que será removido' })
    @ApiOkResponse({ description: 'Formulário removido' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Delete('/:id/remove')
    @Roles(RolesEnum.GESTOR)
    async remove(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
        const existente = await this.documentoFormularioService.findFormFromCompanyAndId(id, user);
        if (!existente) {
            throw GenericException.fromConstant(FormErrors.REGISTRO_NAO_PERTENCE_A_EMPRESA);
        }

        await this.documentoFormularioService.remove(id);
    }

}
