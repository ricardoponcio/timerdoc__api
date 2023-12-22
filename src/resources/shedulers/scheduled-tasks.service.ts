import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DocumentoSentinelaService } from '@resources/documento/documento-sentinela/documento-sentinela.service';

@Injectable()
export class ScheduledTasksService {

    private readonly logger = new Logger(ScheduledTasksService.name);

    constructor(private documentoSentinelaService: DocumentoSentinelaService) { };

    @Cron('0 */3 * * * *')
    callDocumentoSentinela() {
        this.documentoSentinelaService.processDocumentsAlerts();
    }

}