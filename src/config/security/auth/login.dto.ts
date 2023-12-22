import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail() @IsNotEmpty()
    @Expose()
    @ApiProperty({ description: 'Email de acesso', type: String })
    email: string;

    @IsString() @IsNotEmpty()
    @Expose()
    @ApiProperty({ description: 'Senha de acesso, não criptografada', type: String })
    password: string
}