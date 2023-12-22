import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ReadSimpleUser {

    @Expose()
    nome: string;

    @Expose()
    email: string

}
