import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { DocumentErrors } from '@app/core/constants/definition/errors/3xx.document.errors';
import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { AuditoriaService } from '@app/resources/auditoria/auditoria.service';
import { ModelHistoryDto } from '@app/resources/auditoria/dto/model-history.dto';
import { CreateDocumentoGeralDto } from '@app/resources/documento/documento-geral/dto/create-documento-geral.dto';
import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { UsuarioEmpresaService } from '@app/resources/shared/usuario-empresa/usuario-empresa.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentoGeralService } from '@resources/documento/documento-geral/documento-geral.service';
import { UpdateDocumentoGeralDto } from '@resources/documento/documento-geral/dto/update-documento-geral.dto';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { DocumentoRecorrenteService } from '../documento-recorrente/documento-recorrente.service';
import { DocumentoSentinelaService } from '../documento-sentinela/documento-sentinela.service';

@ApiTags('Documents') @ApiExtraModels(DocumentoGeral)
@ApiBearerAuth()
@Controller('/documents')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class DocumentoGeralController {

  constructor(private readonly documentoGeralService: DocumentoGeralService,
    private readonly documentoRecorrenteService: DocumentoRecorrenteService,
    private readonly auditoriaService: AuditoriaService,
    private readonly usuarioEmpresaService: UsuarioEmpresaService,
    private readonly documentoSentinelaService: DocumentoSentinelaService) { }

  @ApiBody({ type: CreateDocumentoGeralDto, description: 'Objeto com dados base da criação de um Documento Geral' })
  @ApiOkResponse({ description: 'Retorno do registro de Documento Geral criado', type: DocumentoGeral })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Roles(RolesEnum.USUARIO)
  @Post('/new')
  async create(@MyCompany() user: UserCompanyPayload, @Body() createDocumentoGeralDto: CreateDocumentoGeralDto) {
    const newDoc = createDocumentoGeralDto.toDocumentoGeral();
    newDoc.usuarioId = user.id;
    newDoc.empresaId = user.sub.empresaId;

    if (createDocumentoGeralDto.responsavelId) {
      const pertenceEmpresa = await this.usuarioEmpresaService.usuarioPertenceEmpresa(createDocumentoGeralDto.responsavelId, user.sub.empresaId);
      if (!pertenceEmpresa) {
        throw GenericException.fromConstant(UserErrors.USUARIO_NAO_PODE_SER_INCLUIDO_COMO_RESPONSAVEL, ['responsavelId']);
      }
    }

    const criado = await this.documentoGeralService.create(newDoc);
    this.documentoSentinelaService.processDocumentAlert(criado.id);

    return instanceToPlain(criado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiOkResponse({ type: DocumentoGeral, isArray: true, description: 'Documentos cadastrados na empresa logada' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/list')
  @Roles(RolesEnum.VISUALIZADOR)
  async findAll(@MyCompany() user: UserCompanyPayload) {
    const documentos = await this.documentoGeralService.findAll({
      empresaId: user.sub.empresaId
    });
    return instanceToPlain(documentos, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do documento geral para busca' })
  @ApiOkResponse({ type: DocumentoGeral, description: 'Documento encontrado na busca' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:id/detail')
  @Roles(RolesEnum.VISUALIZADOR)
  async findOne(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
    const encontrado = await this.documentoGeralService.findById(id, {
      empresaId: user.sub.empresaId
    });
    return instanceToPlain(encontrado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do documento geral que será atualizado' })
  @ApiBody({ type: UpdateDocumentoGeralDto, description: 'Patch dos dados que será atualizado no registro do documento geral' })
  @ApiOkResponse({ type: DocumentoGeral, description: 'Documento atualizado' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Patch('/:id/update')
  @Roles(RolesEnum.USUARIO)
  async update(@MyCompany() user: UserCompanyPayload, @Param('id') id: number, @Body() updateDocumentoGeralDto: UpdateDocumentoGeralDto) {
    this.documentoGeralService.checkOwner(await this.documentoGeralService.findById(id, {}), user);
    const corrente = await this.documentoGeralService.findById(id);

    const recorrenciaAlterada = updateDocumentoGeralDto.recorrencia && updateDocumentoGeralDto.recorrencia !== corrente.recorrencia;
    const periodicidadeAlterada = updateDocumentoGeralDto.periodicidade && updateDocumentoGeralDto.periodicidade !== corrente.periodicidade;
    const inicioContagemAlterada = updateDocumentoGeralDto.inicioContagem && new Date(updateDocumentoGeralDto.inicioContagem).getTime() !== corrente.inicioContagem.getTime();

    if (recorrenciaAlterada || periodicidadeAlterada) {
      const releases = await this.documentoRecorrenteService.findFromDoc(id);
      if (releases && releases.length > 1) {
        throw GenericException.fromConstant(DocumentErrors.JA_POSSUI_ENTREGAS_FEITAS_TRAVA, [
          ...(recorrenciaAlterada ? ['recorrencia'] : []),
          ...(periodicidadeAlterada ? ['periodicidade'] : [])
        ]);
      }
    }
    if (inicioContagemAlterada) {
      const releases = await this.documentoRecorrenteService.findFromDoc(id);
      if (releases && releases.length > 0) {
        throw GenericException.fromConstant(DocumentErrors.JA_POSSUI_ENTREGAS_FEITAS_TRAVA, [
          ...(inicioContagemAlterada ? ['inicioContagem'] : [])
        ]);
      }
    }
    if (updateDocumentoGeralDto.fimContagem) {
      const releases = await this.documentoRecorrenteService.findFromDoc(id);
      releases.sort((a, b) => b.competenciaReferencia.getTime() - a.competenciaReferencia.getTime());
      if (new Date(updateDocumentoGeralDto.fimContagem).getTime() < releases[0].competenciaReferencia.getTime()) {
        throw GenericException.fromConstant(DocumentErrors.DATA_FIM_MENOR_QUE_MAIOR_ENTREGA);
      }
    }

    if (updateDocumentoGeralDto.responsavelId) {
      const pertenceEmpresa = await this.usuarioEmpresaService.usuarioPertenceEmpresa(updateDocumentoGeralDto.responsavelId, user.sub.empresaId);
      if (!pertenceEmpresa) {
        throw GenericException.fromConstant(UserErrors.USUARIO_NAO_PODE_SER_INCLUIDO_COMO_RESPONSAVEL, ['responsavelId']);
      }
    }

    await this.documentoGeralService.update(id, updateDocumentoGeralDto);
    const atualizado = await this.documentoGeralService.findById(id);
    this.documentoSentinelaService.processDocumentAlert(atualizado.id);

    return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true });
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do documento geral que será removido da empresa' })
  @ApiOkResponse({ description: 'Registro removido' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Delete('/:id/remove')
  @Roles(RolesEnum.GESTOR)
  async remove(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
    this.documentoGeralService.checkOwner(await this.documentoGeralService.findById(id, {}), user);

    const encontrado = await this.documentoGeralService.findById(id, {
      empresaId: user.sub.empresaId
    });
    if (!encontrado) {
      throw GenericException.fromConstant(DocumentErrors.REGISTRO_INVALIDO);
    }

    await this.documentoGeralService.remove(id);
  }

  @ApiParam({ name: 'id', type: Number, description: 'ID do documento geral que será buscado o histórico' })
  @ApiOkResponse({ type: ModelHistoryDto, description: 'Registros de alterações' })
  @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
  @Get('/:id/history')
  @Roles(RolesEnum.GESTOR)
  async history(@MyCompany() user: UserCompanyPayload, @Param('id') id: number) {
    this.documentoGeralService.checkOwner(await this.documentoGeralService.findById(id, {}), user);
    const encontrado = await this.documentoGeralService.findById(id);
    return await this.auditoriaService.findHistory(encontrado);
  }

}
