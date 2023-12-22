import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class FormErrors {

    static __type = ErrorType.BUSINESS;

    static NIVEL_INFORMADO_REQUER_MAIS_ATRIBUTOS: ErrorConstant = {
        id: 10001,
        type: FormErrors.__type,
        i18n_key: 'BSS_ERR_FORM_10001',
    };
    static REGISTRO_NAO_PERTENCE_A_EMPRESA: ErrorConstant = {
        id: 10002,
        type: FormErrors.__type,
        i18n_key: 'BSS_ERR_FORM_10002',
    };

}