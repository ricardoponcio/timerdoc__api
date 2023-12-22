import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class InviteErrors {

    static __type = ErrorType.BUSINESS;

    static CONVITE_USUARIO_EMPRESA_JA_UTILIZADO: ErrorConstant = {
        id: 7001,
        type: InviteErrors.__type,
        i18n_key: 'BSS_ERR_USERCOMPANYINVITE_7001',
    };
    static EMAIL_CADASTRO_E_CONVITE_DIVERGEM: ErrorConstant = {
        id: 7002,
        type: InviteErrors.__type,
        i18n_key: 'BSS_ERR_USERCOMPANYINVITE_7002',
    };
    static CONVITE_ENVIADO_PARA_OUTRO_USUARIO: ErrorConstant = {
        id: 7003,
        type: InviteErrors.__type,
        i18n_key: 'BSS_ERR_USERCOMPANYINVITE_7003',
    };
    static CONVITE_NAO_ENCONTRADO: ErrorConstant = {
        id: 7004,
        type: InviteErrors.__type,
        i18n_key: 'BSS_ERR_USERCOMPANYINVITE_7004',
    };
    static CONVITE_ENVIADO_DE_OUTRA_EMPRESA: ErrorConstant = {
        id: 7005,
        type: InviteErrors.__type,
        i18n_key: 'BSS_ERR_USERCOMPANYINVITE_7005',
    };

}