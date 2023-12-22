import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class CompanyErrors {

    static __type = ErrorType.BUSINESS;

    static REGISTRO_JA_EXISTE: ErrorConstant = {
        id: 6001,
        type: CompanyErrors.__type,
        i18n_key: 'BSS_ERR_COMPANY_6001',
    };
    static REGISTRO_NAO_PERTENCE_USUARIO: ErrorConstant = {
        id: 6002,
        type: CompanyErrors.__type,
        i18n_key: 'BSS_ERR_COMPANY_6002',
    };
    static DOC_FORMATO_INVALIDO: ErrorConstant = {
        id: 6003,
        type: CompanyErrors.__type,
        i18n_key: 'BSS_ERR_COMPANY_6003',
    };

}