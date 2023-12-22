import { IsString } from "class-validator";

export class ReadPlanoDto {

    @IsString()
    nome: string;

}