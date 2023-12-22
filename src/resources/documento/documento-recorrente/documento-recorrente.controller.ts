import { TipoArquivoEnum } from '@storage/entities/armazenamento-acao.entity';
import { BufferedFile } from '@storage/storage.interfaces';
import { MinIOService } from '@storage/storage.service';
import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { DocumentErrors } from '@app/core/constants/definition/errors/3xx.document.errors';
import { ReleaseErrors } from '@app/core/constants/definition/errors/4xx.release.errors';
import { UserErrors } from '@app/core/constants/definition/errors/5xx.user.errors';
import { AttachErrors } from '@app/core/constants/definition/errors/8xx.attach.errors';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { AuditoriaService } from '@app/resources/auditoria/auditoria.service';
import { ModelHistoryDto } from '@app/resources/auditoria/dto/model-history.dto';
import { DocumentoRecorrenteObservacao } from '@app/resources/documento/documento-recorrente-observacao/entities/documento-recorrente-observacao.entity';
import { CreateDocumentoRecorrenteDto } from '@app/resources/documento/documento-recorrente/dto/create-documento-recorrente.dto';
import { DocumentoRecorrente, SituacaoEntregaEnum } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';
import { ReleasesPreview } from '@app/resources/documento/documento-sentinela/dto/releases-preview.dto';
import { EmpresasService } from '@app/resources/shared/empresas/empresas.service';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { UsuarioEmpresaService } from '@app/resources/shared/usuario-empresa/usuario-empresa.service';
import { Body, Controller, Delete, Get, Param, Patch, Post, Res, StreamableFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiExtraModels, ApiOkResponse, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentoGeralService } from '@resources/documento/documento-geral/documento-geral.service';
import { DocumentoRecorrenteAnexoService } from '@resources/documento/documento-recorrente-anexo/documento-recorrente-anexo.service';
import { DocumentoRecorrenteObservacaoService } from '@resources/documento/documento-recorrente-observacao/documento-recorrente-observacao.service';
import { DocumentoRecorrenteService } from '@resources/documento/documento-recorrente/documento-recorrente.service';
import { UpdateDocumentoRecorrenteDto } from '@resources/documento/documento-recorrente/dto/update-documento-recorrente.dto';
import { DocumentoSentinelaService } from '@resources/documento/documento-sentinela/documento-sentinela.service';
import { instanceToPlain } from 'class-transformer';
import { Response } from 'express';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';
import { DocumentoRecorrenteAnexo } from '../documento-recorrente-anexo/entities/documento-recorrente-anexo.entity';
import { CreateDocumentoRecorrenteObservacaoDto } from '../documento-recorrente-observacao/dto/create-documento-recorrente-observacao.dto';

@ApiTags('Documents') @ApiExtraModels(DocumentoRecorrente)
@ApiBearerAuth()
@Controller('/documents')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class DocumentoRecorrenteController {

    constructor(private readonly documentoRecorrenteService: DocumentoRecorrenteService,
        private readonly documentoRecorrenteAnexoService: DocumentoRecorrenteAnexoService,
        private readonly documentoGeralService: DocumentoGeralService,
        private readonly documentoRecorrenteObservacaoService: DocumentoRecorrenteObservacaoService,
        private readonly documentoSentinelaService: DocumentoSentinelaService,
        private readonly empresaService: EmpresasService,
        private readonly auditoriaService: AuditoriaService,
        private minioClientService: MinIOService,
        private readonly usuarioEmpresaService: UsuarioEmpresaService) { }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para atrelar a entrega' })
    @ApiBody({ type: CreateDocumentoRecorrenteDto, description: 'Objeto com dados para criação da ocorrência de um documento geral' })
    @ApiOkResponse({ description: 'Registro de ocorrência criado', type: DocumentoRecorrente })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/:document/release/new')
    @Roles(RolesEnum.USUARIO)
    async create(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Body() createDocumentoRecorrenteDto: CreateDocumentoRecorrenteDto) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const newDoc = createDocumentoRecorrenteDto.toDocumentoRecorrente();
        newDoc.usuarioUltimaAlteracaoId = user.id;
        newDoc.documentoGeralId = documentId;

        const openRelease = await this.documentoRecorrenteService.findOpenReleaseFromDoc(newDoc.documentoGeralId);
        if (openRelease)
            throw GenericException.fromConstant(DocumentErrors.JA_POSSUI_ENTREGA);
        const sameReference = await this.documentoRecorrenteService.findSameReference(document.id, newDoc.competenciaReferencia);
        if (sameReference)
            throw GenericException.fromConstant(ReleaseErrors.COMPETENCIA_REFERENCIA_DUPLICADA);
        const inPreview = await this.documentoSentinelaService.checkEntregaInPreview(document, newDoc.competenciaReferencia);
        if (!inPreview)
            throw GenericException.fromConstant(ReleaseErrors.COMPETENCIA_INVALIDA);

        if (createDocumentoRecorrenteDto.responsavelId) {
            const pertenceEmpresa = await this.usuarioEmpresaService.usuarioPertenceEmpresa(createDocumentoRecorrenteDto.responsavelId, user.sub.empresaId);
            if (!pertenceEmpresa) {
                throw GenericException.fromConstant(UserErrors.USUARIO_NAO_PODE_SER_INCLUIDO_COMO_RESPONSAVEL, ['responsavelId']);
            }
        }

        const criado = await this.documentoRecorrenteService.create(newDoc);
        this.documentoSentinelaService.processDocumentAlert(documentId);

        return instanceToPlain(criado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiOkResponse({ type: DocumentoRecorrente, isArray: true, description: 'Registros de entregas realizadas para o documento' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/list')
    @Roles(RolesEnum.VISUALIZADOR)
    async findAll(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const ocorrencias = await this.documentoRecorrenteService.findAll({
            documentoGeralId: documentId
        });
        return instanceToPlain(ocorrencias, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiOkResponse({ type: Date, isArray: true, description: 'Competências das ocorrências dos documentos' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/references')
    @Roles(RolesEnum.VISUALIZADOR)
    async findAllReferences(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const releases = await this.documentoRecorrenteService.findAll({
            documentoGeralId: documentId
        });
        return instanceToPlain(releases?.map(r => r.competenciaReferencia));
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiOkResponse({ type: ReleasesPreview, isArray: true, description: 'Retorno com histórico de entregas, detalhamento das ocorrências e previsões futuras' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/preview')
    @Roles(RolesEnum.VISUALIZADOR)
    async findPreview(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number) {
        const document = await this.documentoGeralService.findById(documentId, {}, true);
        this.documentoGeralService.checkOwner(document, user);

        const previews = await this.documentoSentinelaService.previewReleases(document, true);
        const previewsSorted = previews?.sort((a: ReleasesPreview, b: ReleasesPreview) => b.data.getTime() - a.data.getTime());
        return instanceToPlain(previewsSorted);
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência para detalhamento' })
    @ApiOkResponse({ type: DocumentoRecorrente, description: 'Registro encontrado da ocorrência detalhada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/:id/detail')
    @Roles(RolesEnum.VISUALIZADOR)
    async findOne(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);

        return instanceToPlain(release, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência para atualização' })
    @ApiBody({ type: UpdateDocumentoRecorrenteDto, description: 'Objeto com atributos para serem atualizados no registro solicitado' })
    @ApiOkResponse({ type: DocumentoRecorrente, description: 'Retorno com a entrega atualizada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Patch('/:document/release/:id/update')
    @Roles(RolesEnum.USUARIO)
    async update(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number, @Body() updateDocumentoRecorrenteDto: UpdateDocumentoRecorrenteDto) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const oldRelease = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(oldRelease, user);
        if (oldRelease.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);
        if (oldRelease.situacao === SituacaoEntregaEnum.ENTREGUE)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_ENTREGUE_NAO_PERMITE_ATUALIZACAO_REMOCAO);

        if (updateDocumentoRecorrenteDto.responsavelId) {
            const pertenceEmpresa = await this.usuarioEmpresaService.usuarioPertenceEmpresa(updateDocumentoRecorrenteDto.responsavelId, user.sub.empresaId);
            if (!pertenceEmpresa) {
                throw GenericException.fromConstant(UserErrors.USUARIO_NAO_PODE_SER_INCLUIDO_COMO_RESPONSAVEL, ['responsavelId']);
            }
        }

        await this.documentoRecorrenteService.update(id, updateDocumentoRecorrenteDto, user);
        this.documentoSentinelaService.processDocumentAlert(documentId);
        const atualizado = await this.documentoRecorrenteService.findById(id);

        return instanceToPlain(atualizado, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência que deseja-se remover' })
    @ApiOkResponse({ description: 'Registro excluído com sucesso' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Delete('/:document/release/:id/remove')
    @Roles(RolesEnum.GESTOR)
    async remove(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);

        await this.documentoRecorrenteService.remove(id);
        this.documentoSentinelaService.processDocumentAlert(documentId);
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência que deseja-se inserir uma observação' })
    @ApiBody({ type: CreateDocumentoRecorrenteObservacaoDto, description: 'Objeto contendo a anotação a ser inserida' })
    @ApiOkResponse({ type: DocumentoRecorrenteObservacao, description: 'Registro da observação criada' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/:document/release/:id/note')
    @Roles(RolesEnum.USUARIO)
    async newDocumentNote(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number,
        @Param('id') id: number, @Body() observacaoDetail: CreateDocumentoRecorrenteObservacaoDto) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);

        const newObs = await this.documentoRecorrenteObservacaoService.create(observacaoDetail.observacao, user.id, release);
        return instanceToPlain(newObs, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência que deseja-se inserir o anexo' })
    @ApiOkResponse({ type: DocumentoRecorrenteAnexo, isArray: true, description: 'Registros de anexos criados' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Post('/:document/release/:id/upload')
    @UseInterceptors(AnyFilesInterceptor())
    @Roles(RolesEnum.USUARIO)
    async newDocumentRelease(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number,
        @UploadedFiles() files: Array<BufferedFile>) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);

        if (!await this.empresaService.supportUploadSize(files, user)) {
            throw GenericException.fromConstant(AttachErrors.MAXIMO_UPLOAD_EXCEDE_LIMITE_EMPRESA);
        }

        const arquivosMuitoGranges = await this.empresaService.filesExceedMaxSizePerUpload(files, user);
        if (arquivosMuitoGranges && arquivosMuitoGranges.length > 0) {
            throw GenericException.fromConstant(AttachErrors.EXCEDE_TAMANHO_MAXIMO, arquivosMuitoGranges.map(f => f.originalname));
        }

        const anexos = await Promise.all(files?.map(async file => {
            const reference = await this.minioClientService.uploadCompanyFile(file, `/document/${document.id}/release/${release.id}`, {
                tipoArquivo: TipoArquivoEnum.OcorrenciaAnexo,
                origem: document.empresa
            }, user);
            try {
                const hashedName = reference.url.split('/');
                const anexoRegistro = await this.documentoRecorrenteAnexoService.create(
                    this.documentoRecorrenteAnexoService.buildAttach(
                        {
                            ...file,
                            mimetype: file.mimetype,
                            reference: reference.url,
                            path: reference.path,
                            bucket: reference.bucket,
                            encodedName: hashedName.pop() || hashedName.pop()
                        }, release)
                );
                return anexoRegistro;
            } catch (err) {
                await this.minioClientService.deleteCompanyFile(reference.path, reference.bucket, {
                    tipoArquivo: TipoArquivoEnum.OcorrenciaAnexo,
                    origem: document.empresa
                }, user);
            }
        }));
        return instanceToPlain(anexos, { enableCircularCheck: false, excludeExtraneousValues: true });
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência que deseja-se inserir o anexo' })
    @ApiParam({ name: 'attachId', type: Number, description: 'ID do anexo para download' })
    @ApiOkResponse({ description: 'Anexo salvo' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/:id/download/:attachId')
    @Roles(RolesEnum.USUARIO)
    async getDocumentRelease(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number,
        @Param('attachId') anexoId: number, @Res({ passthrough: true }) response: Response) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);
        const anexo = await this.documentoRecorrenteAnexoService.findAttach(anexoId, release);
        if (!anexo)
            throw GenericException.fromConstant(AttachErrors.REGISTRO_NAO_ENCONTRATO);

        response.set({
            'Content-Type': anexo.tipoArquivo,
        });
        const stream = await this.minioClientService.downloadCompanyFile(anexo.caminhoS3, anexo.bucketS3, {
            tipoArquivo: TipoArquivoEnum.OcorrenciaAnexo,
            origem: document.empresa
        }, user);
        return new StreamableFile(stream);
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência que deseja-se remover o anexo' })
    @ApiParam({ name: 'attachId', type: Number, description: 'ID do anexo para remoção' })
    @ApiOkResponse({ description: 'Anexo removido' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Delete('/:document/release/:id/attach-delete/:attachId')
    @Roles(RolesEnum.USUARIO)
    async removeDocumentRelease(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number,
        @Param('attachId') anexoId: number, @Res({ passthrough: true }) response: Response) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id, {}, true);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);
        const anexo = await this.documentoRecorrenteAnexoService.findAttach(anexoId, release);
        if (!anexo)
            throw GenericException.fromConstant(AttachErrors.REGISTRO_NAO_ENCONTRATO);

        await this.minioClientService.deleteCompanyFile(anexo.caminhoS3, anexo.bucketS3, {
            tipoArquivo: TipoArquivoEnum.OcorrenciaAnexo,
            origem: document.empresa
        }, user);
        await this.documentoRecorrenteAnexoService.remove(anexoId);
    }

    @ApiParam({ name: 'document', type: Number, description: 'Documento geral para buscar vínculo com ocorrências' })
    @ApiParam({ name: 'id', type: Number, description: 'ID da ocorrência visualizar histórico' })
    @ApiOkResponse({ type: ModelHistoryDto, description: 'Registro de alterações' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/:document/release/:id/history')
    @Roles(RolesEnum.VISUALIZADOR)
    async history(@MyCompany() user: UserCompanyPayload, @Param('document') documentId: number, @Param('id') id: number) {
        const document = await this.documentoGeralService.findById(documentId);
        this.documentoGeralService.checkOwner(document, user);
        const release = await this.documentoRecorrenteService.findById(id);
        this.documentoRecorrenteService.checkOwner(release, user);
        if (release.documentoGeralId !== document.id)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_NAO_PARTICIPA_DOCUMENTO);

        return await this.auditoriaService.findHistory(release);
    }

}
