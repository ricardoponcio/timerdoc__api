import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class VariableErrors {

    static __type = ErrorType.BUSINESS;

    static NIVEL_INFORMADO_REQUER_MAIS_ATRIBUTOS: ErrorConstant = {
        id: 9001,
        type: VariableErrors.__type,
        i18n_key: 'BSS_ERR_VARIABLE_9001',
    };
    static REGISTRO_NAO_PERTENCE_A_EMPRESA: ErrorConstant = {
        id: 9002,
        type: VariableErrors.__type,
        i18n_key: 'BSS_ERR_FORM_9002',
    };

}