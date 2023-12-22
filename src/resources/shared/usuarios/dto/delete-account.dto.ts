import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteAccountDto {

    @IsNotEmpty()
    @ApiProperty({ description: 'Senha de acesso à plataforma', type: String })
    senha: string;

}
