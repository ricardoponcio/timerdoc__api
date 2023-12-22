import { Expose } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { Empresa } from "../entities/empresa.entity";

export class ReadEmpresaDto {

    @Expose()
    id: number;

    @IsString() @Expose()
    cnpj: string;

    @IsString() @Expose()
    razaoSocial: string;

    @IsString() @Expose()
    fantasia: string;

    @IsOptional()
    toEmpresa = (): Empresa => {
        const empresa = new Empresa();
        empresa.cnpj = this.cnpj;
        empresa.fantasia = this.fantasia;
        empresa.razaoSocial = this.razaoSocial;
        return empresa;
    }
}
