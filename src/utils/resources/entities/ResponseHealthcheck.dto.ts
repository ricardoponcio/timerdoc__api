import { ApiProperty } from "@nestjs/swagger";

export class ResponseHealthcheckDto{
    @ApiProperty({default:true})
    status: boolean;
}