import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateDocumentoRecorrenteObservacaoDto {

    @IsString()
    @ApiProperty({ description: 'Observação da ocorrência', type: String })
    observacao: string;

}
