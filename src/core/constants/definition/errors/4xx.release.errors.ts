import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class ReleaseErrors {

    static __type = ErrorType.BUSINESS;

    static REGISTRO_DOCUMENTO_INVALIDO: ErrorConstant = {
        id: 4001,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4001',
    };
    static REGISTRO_NAO_PARTICIPA_DOCUMENTO: ErrorConstant = {
        id: 4002,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4002',
    };
    static COMPETENCIA_REFERENCIA_DUPLICADA: ErrorConstant = {
        id: 4003,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4003',
    };
    static COMPETENCIA_INVALIDA: ErrorConstant = {
        id: 4004,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4004',
    };
    static COMPETENCIA_REFERENCIA_DUPLICADA_EXCECAO: ErrorConstant = {
        id: 4005,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4005',
    };
    static REGISTRO_ENTREGUE_NAO_PERMITE_ATUALIZACAO_REMOCAO: ErrorConstant = {
        id: 4006,
        type: ReleaseErrors.__type,
        i18n_key: 'BSS_ERR_RELEASE_4006',
    };

}