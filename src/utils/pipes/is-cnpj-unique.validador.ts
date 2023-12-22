import { EmpresasService } from "@shared/empresas/empresas.service";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraintInterface } from "class-validator";

// TODO: não esta funcionado via class-validator, arrumar depois
export class IsCnpjUniqueConstraint implements ValidatorConstraintInterface {

    constructor(private empresaService: EmpresasService) { }

    public validate(cnpj: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
        console.log('validando CNPJ');

        return !!!this.empresaService.findByCpnj(cnpj);
    }
}

export function IsCnpjUnique(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsCnpjUniqueConstraint
        });
    }
}
