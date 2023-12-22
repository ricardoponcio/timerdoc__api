import { IsCnpjUnique } from "@app/utils/pipes/is-cnpj-unique.validador";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumberString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { Empresa } from "../entities/empresa.entity";

export class CreateEmpresaDto {

    @IsNumberString() @MinLength(14) @MaxLength(14) @IsCnpjUnique()
    @ApiProperty({ nullable: false, description: 'CPNJ da empresa', type: String })
    cnpj: string;

    @IsString()
    @ApiProperty({ nullable: false, description: 'Razão social do cadastro', type: String })
    razaoSocial: string;

    @IsString() @IsOptional()
    @ApiProperty({ nullable: false, required: false, description: 'Nome fantasia da empresa', type: String })
    fantasia: string;

    @IsOptional()
    toEmpresa = (): Empresa => {
        const empresa = new Empresa();
        empresa.cnpj = this.cnpj
        empresa.fantasia = this.fantasia
        empresa.razaoSocial = this.razaoSocial
        return empresa;
    }
}
