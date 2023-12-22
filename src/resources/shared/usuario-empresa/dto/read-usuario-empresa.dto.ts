import { ReadEmpresaDto } from '@shared/empresas/dto/read-empresa.dto';
import { ReadRoleDto } from '@shared/role/dto/read-role.dto';
import { Expose, Type } from 'class-transformer';

export class ReadUsuarioEmpresaDto {

    @Expose() @Type(() => ReadRoleDto)
    role: ReadRoleDto;

    @Expose() @Type(() => ReadEmpresaDto)
    empresa: ReadEmpresaDto;
}
