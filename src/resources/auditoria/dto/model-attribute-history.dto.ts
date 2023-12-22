import { ApiProperty } from "@nestjs/swagger";

export class ModelAttributeHistoryDto {

    @ApiProperty({ description: 'Atributo alterado' })
    attribute !: string;

    @ApiProperty({ description: 'Valor antes da alteração' })
    previousValue !: any;

    @ApiProperty({ description: 'Valor após a alteração' })
    newValue !: any;

}
