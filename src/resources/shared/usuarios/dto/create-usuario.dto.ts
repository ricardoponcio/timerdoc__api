import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { RolesEnum } from "../../role/entity/role.entity";

export class CreateUsuarioDto {

    @MaxLength(150) @IsNotEmpty()
    @ApiProperty({ description: 'Nome do Usuário', type: String })
    nome: string;

    @MaxLength(255) @IsEmail()
    @ApiProperty({ description: 'Email do usuário convidado', type: String })
    email: string;

    @IsString()
    @ApiProperty({ description: 'Role de atribuição do vínculo', enum: [RolesEnum] })
    roleName: string;

}
