import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";

export class LoginResponseDto {
    @Expose() @ApiProperty({ description: 'Tipo do Token de acesso', default: 'Bearer', type: String })
    type: string;

    @Expose() @ApiProperty({ description: 'Token de acesso', type: String })
    access_token: string
}