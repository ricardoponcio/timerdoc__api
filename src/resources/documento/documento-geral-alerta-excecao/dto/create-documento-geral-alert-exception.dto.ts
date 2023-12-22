import { ApiProperty } from "@nestjs/swagger";
import { IsDateString } from "class-validator";

export class CreateDocumentoGeralAlertException {
    @IsDateString()
    @ApiProperty({ description: 'Competência que será ignorada do documento geral', type: Date, format: 'date' })
    competenciaReferencia: Date;
}
