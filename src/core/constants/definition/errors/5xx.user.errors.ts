import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class UserErrors {

    static __type = ErrorType.BUSINESS;

    static EMAIL_JA_EXISTE: ErrorConstant = {
        id: 5001,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5001',
    };
    static REGISTRO_NAO_PERTENCE_EMPRESA: ErrorConstant = {
        id: 5002,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5002',
    };
    static NENHUM_USUARIO_NA_EMPRESA: ErrorConstant = {
        id: 5003,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5003',
    };
    static HASH_INFORMADO_NAO_EXISTE: ErrorConstant = {
        id: 5004,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5004',
    };
    static SENHAS_INFORMADAS_NAO_COINCIDEM: ErrorConstant = {
        id: 5005,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5005',
    };
    static REGISTRO_PENDENTE_VERIFICACAO: ErrorConstant = {
        id: 5006,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5006',
    };
    static EMAIL_NAO_EXISTE: ErrorConstant = {
        id: 5007,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5007',
    };
    static ACAO_PROIBIDA: ErrorConstant = {
        id: 5008,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5008',
    };
    static REGISTRO_VINCULO_EMPRESA_NAO_INFORMADO: ErrorConstant = {
        id: 5009,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5009',
    };
    static REGISTRO_JA_EXISTE_NA_EMPRESA_SOLICITADA: ErrorConstant = {
        id: 5010,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_50010',
    };
    static JA_TEM_CONVITE_FEITO: ErrorConstant = {
        id: 5011,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5011',
    };
    static PRECISA_CONCLUIR_REGISTRO: ErrorConstant = {
        id: 5012,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5012',
    };
    static USUARIO_NAO_PODE_SER_INCLUIDO_COMO_RESPONSAVEL: ErrorConstant = {
        id: 5013,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5013',
    };
    static PERFIL_NAO_PERMITE_GERENCIAR_USUARIO: ErrorConstant = {
        id: 5014,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5014',
    };
    static PERFIL_NAO_PERMITE_ALTERAR_PERFIL_MAIS_ALTO: ErrorConstant = {
        id: 5015,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5015',
    };
    static REGISTRO_NAO_ENCONTRADO: ErrorConstant = {
        id: 5016,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5016',
    };
    static HASH_INFORMADO_JA_EXISTE_NA_BASE: ErrorConstant = {
        id: 5017,
        type: UserErrors.__type,
        i18n_key: 'BSS_ERR_USER_5017',
    };

}