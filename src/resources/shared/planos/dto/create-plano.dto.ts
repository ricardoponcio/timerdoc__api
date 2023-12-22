import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Plano } from "../plano.entity";

export class CreatePlanoDto {

    @IsNotEmpty()
    @ApiProperty()
    nome: string;

    toPlano() : Plano {
        const plano = new Plano();
        plano.nome = this.nome
        return plano;
    }
}