import { Empresa } from "@app/resources/shared/empresas/entities/empresa.entity";
import { ReadUsuarioDto } from "@app/resources/shared/usuarios/dto/read-usuario.dto";
import { Usuario } from "@app/resources/shared/usuarios/entities/usuario.entity";
import { instanceToPlain } from "class-transformer";
const _ = require('lodash');

export class TokenUtils {

    static buildUserPayload(usuario: Usuario): any {
        return {
            id: usuario.id,
            email: usuario.email,
        };
    }

    static convertUserSecureValue(usuario: Usuario): any {
        return {
            user: instanceToPlain(usuario, {
                excludeExtraneousValues: true,
                targetMaps: [{ target: () => ReadUsuarioDto, properties: {} }],
            })
        };
    }

    static buildCompanyPayload(usuario: Usuario, company: Empresa): any {
        return {
            id: usuario.id,
            email: usuario.email,
            sub: {
                empresaId: company.id,
            },
        }
    }

    static convertCompanySecureValue(company: Empresa): any {
        return {
            company_data: _.pick(company, ['razaoSocial', 'id', 'cnpj', 'fantasia'])
        };
    }

}