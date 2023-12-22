import { ApiProperty } from "@nestjs/swagger";

export class ModelHistoryChangeTypeDto {

    @ApiProperty({ description: 'Tipo de alteração', type: String })
    type !: String;

    @ApiProperty({ description: 'Descrição da alteração', type: String })
    description !: String;

}
