import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RolesEnum } from '../../role/entity/role.entity';

export class UpdateRoleUsuarioDto {

    @IsString() @IsNotEmpty()
    @ApiProperty({ description: 'Nova role', enum: [RolesEnum] })
    roleName: string;

}
