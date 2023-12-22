import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class TokenErrors {

    static __type = ErrorType.BUSINESS;

    static ACAO_INVALIDA: ErrorConstant = {
        id: 1001,
        type: TokenErrors.__type,
        i18n_key: 'BSS_ERR_TOKEN_1001'
    }

}