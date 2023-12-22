import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class DocumentErrors {

    static __type = ErrorType.BUSINESS;

    static REGISTRO_INVALIDO: ErrorConstant = {
        id: 3001,
        type: DocumentErrors.__type,
        i18n_key: 'BSS_ERR_DOCUMENT_3001',
    };
    static JA_POSSUI_ENTREGA: ErrorConstant = {
        id: 3002,
        type: DocumentErrors.__type,
        i18n_key: 'BSS_ERR_DOCUMENT_3002',
    };
    static JA_POSSUI_ENTREGAS_FEITAS_TRAVA: ErrorConstant = {
        id: 3003,
        type: DocumentErrors.__type,
        i18n_key: 'BSS_ERR_DOCUMENT_3003',
    };
    static DATA_FIM_MENOR_QUE_MAIOR_ENTREGA: ErrorConstant = {
        id: 3004,
        type: DocumentErrors.__type,
        i18n_key: 'BSS_ERR_DOCUMENT_3004',
    };

}