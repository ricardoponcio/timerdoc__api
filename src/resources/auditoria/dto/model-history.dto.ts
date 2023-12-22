import { ReadSimpleUser } from "@app/resources/shared/usuarios/dto/read-simple-usuario.dto";
import { ApiProperty } from "@nestjs/swagger";
import { ModelAttributeHistoryDto } from "./model-attribute-history.dto";
import { ModelHistoryChangeTypeDto } from "./model-history-change-type.dto";

export class ModelHistoryDto {

    @ApiProperty({ description: 'Data de alteração', type: Date, format: 'date' })
    date !: Date;

    @ApiProperty({ description: 'Usuário que alterou', type: String })
    changedBy !: ReadSimpleUser;

    @ApiProperty({ description: 'Tipo de alteração', type: ModelHistoryChangeTypeDto })
    changeType !: ModelHistoryChangeTypeDto;

    @ApiProperty({ description: 'Alterações', isArray: true, type: ModelAttributeHistoryDto })
    changes !: ModelAttributeHistoryDto[];

}
