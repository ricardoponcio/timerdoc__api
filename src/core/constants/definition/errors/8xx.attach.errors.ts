import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class AttachErrors {

    static __type = ErrorType.BUSINESS;

    static REGISTRO_NAO_ENCONTRATO: ErrorConstant = {
        id: 8001,
        type: AttachErrors.__type,
        i18n_key: 'BSS_ERR_ATTACH_8001',
    };
    static JA_FEITO_UPLOAD: ErrorConstant = {
        id: 8002,
        type: AttachErrors.__type,
        i18n_key: 'BSS_ERR_ATTACH_8002',
    };
    static EXCEDE_TAMANHO_MAXIMO: ErrorConstant = {
        id: 8003,
        type: AttachErrors.__type,
        i18n_key: 'BSS_ERR_ATTACH_8003',
    };
    static MAXIMO_UPLOAD_EXCEDE_LIMITE_EMPRESA: ErrorConstant = {
        id: 8004,
        type: AttachErrors.__type,
        i18n_key: 'BSS_ERR_ATTACH_8004',
    };

}