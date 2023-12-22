import { ApiProperty } from "@nestjs/swagger";

export class ResponseEnvDto{
    @ApiProperty()
    env: string;
    @ApiProperty()
    version: string;
}