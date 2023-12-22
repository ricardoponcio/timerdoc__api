import { ReadUsuarioEmpresaDto } from "@shared/usuario-empresa/dto/read-usuario-empresa.dto";
import { Expose, Type } from "class-transformer";

export class ReadUsuarioDto {

    @Expose()
    nome: string;

    @Expose()
    email: string

    @Expose()
    ativo: boolean = true;

    @Expose()
    telefone: string;

    @Expose()
    idiomaPreferido: string;

    @Expose() @Type(() => ReadUsuarioEmpresaDto)
    empresas: ReadUsuarioEmpresaDto;

}
