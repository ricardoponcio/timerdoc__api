import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { ReleaseErrors } from '@app/core/constants/definition/errors/4xx.release.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesEnum } from '@shared/role/entity/role.entity';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { CreateDocumentoGeralAlertException } from '../documento-geral-alerta-excecao/dto/create-documento-geral-alert-exception.dto';
import { DocumentoGeralAlertaExcecao } from "../documento-geral-alerta-excecao/entities/documento-geral-alerta-excecao.entity";
import { DocumentoSentinelaService } from '../documento-sentinela/documento-sentinela.service';
import { DocumentoGeralService } from './../documento-geral/documento-geral.service';
import { DocumentoGeralAlertaExcecaoService } from './documento-geral-alerta-excecao.service';

@ApiTags('Documents Alerts Exceptions') @ApiExtraModels(DocumentoGeralAlertaExcecao)
@ApiBearerAuth()
@Controller('/documents-alerts-exception')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class DocumentoGeralAlertaExcecaoController {

    constructor(private readonly documentoGeralAlertaExcecaoService: DocumentoGeralAlertaExcecaoService,
        private readonly documentoGeralService: DocumentoGeralService,
        private readonly documentoSentinelaService: DocumentoSentinelaService) { }

    @ApiParam({ name: 'document', type: Number, description: 'ID do documento geral para listagem das exceções' })
    @ApiOkResponse({ type: DocumentoGeralAlertaExcecao, isArray: true, description: 'Exceções vinculadas a um documento' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/list')
    @Roles(RolesEnum.GESTOR)
    async findAllByDocument(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const excecoes = await this.documentoGeralAlertaExcecaoService.listByDocument(document);
        return instanceToPlain(excecoes, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'ID do documento geral para listagem das exceções' })
    @ApiBody({ type: CreateDocumentoGeralAlertException, description: 'Objeto com competência desejada para criar registro de exceção' })
    @ApiOkResponse({ type: DocumentoGeralAlertaExcecao, description: 'Registro da exceção criada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/:document/new')
    @Roles(RolesEnum.GESTOR)
    async newException(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Body() createDocumentoGeralAlertException: CreateDocumentoGeralAlertException) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const inPreview = await this.documentoSentinelaService.checkEntregaInPreview(document, createDocumentoGeralAlertException.competenciaReferencia);
        if (!inPreview)
            throw GenericException.fromConstant(ReleaseErrors.COMPETENCIA_INVALIDA);
        const existente = await this.documentoGeralAlertaExcecaoService.hasException(createDocumentoGeralAlertException.competenciaReferencia, document);
        if (existente)
            throw GenericException.fromConstant(ReleaseErrors.COMPETENCIA_REFERENCIA_DUPLICADA_EXCECAO);

        const novaExcecao = await this.documentoGeralAlertaExcecaoService.create(createDocumentoGeralAlertException.competenciaReferencia, document, user);
        this.documentoSentinelaService.processDocumentAlert(document.id);
        return instanceToPlain(novaExcecao, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'ID do documento geral para buscar vínculo das exceções' })
    @ApiBody({ type: CreateDocumentoGeralAlertException, description: 'Objeto com competência que deseja-se remover das exceções' })
    @ApiOkResponse({ description: 'Remoção bem sucedida da exceção' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Delete('/:document/remove')
    @Roles(RolesEnum.GESTOR)
    async removeException(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Body() createDocumentoGeralAlertException: CreateDocumentoGeralAlertException) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        await this.documentoGeralAlertaExcecaoService.remove(createDocumentoGeralAlertException.competenciaReferencia, document);
        this.documentoSentinelaService.processDocumentAlert(document.id);
    }

}
