import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { MyCompany } from '@app/core/decorators/my-company.decorator';
import { Roles } from '@app/core/decorators/roles.decorator';
import { RolesGuard } from '@app/core/decorators/roles.guard';
import { ReadDocumentoAlertaDto } from '@app/resources/documento/documento-geral-alerta/dto/read-documento-alerta.dto';
import { DocumentoGeralAlerta } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { DocumentUtils } from '@app/utils/document.utils';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiExtraModels, ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DocumentoGeralAlertaService } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.service';
import { instanceToPlain } from 'class-transformer';
import { JwtCompanyAuthGuard } from 'src/config/security/auth/jwt-company-auth.guard';

@ApiTags('Documents Alerts') @ApiExtraModels(DocumentoGeralAlerta)
@ApiBearerAuth()
@Controller('/documents-alerts')
@UseGuards(JwtCompanyAuthGuard, RolesGuard)
export class DocumentoGeralAlertaController {

    constructor(private readonly documentoGeralAlertaService: DocumentoGeralAlertaService) { }

    @ApiOkResponse({ type: DocumentoGeralAlerta, isArray: true, description: 'Alertas cadastrados para os documentos que a empresa administra' })
    @ApiResponse({ status: 500, description: 'Aplicação pode estar com problemas internos.' })
    @Get('/list')
    @Roles(RolesEnum.VISUALIZADOR)
    async findAll(@MyCompany() user: UserCompanyPayload) {
        let alertas = await this.documentoGeralAlertaService.findAllByDocumentsFromCompany(user.sub.empresaId);
        try {
            alertas = alertas.sort(DocumentUtils.sortPriority);
        } catch (err) { };
        return instanceToPlain(alertas.map(a => this.documentoGeralAlertaService.traduzir(a)),
            {
                enableCircularCheck: false, excludeExtraneousValues: true,
                targetMaps: [{ target: () => ReadDocumentoAlertaDto, properties: {} }]
            });
    }

}
