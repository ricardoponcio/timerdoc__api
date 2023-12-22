import { ErrorType } from "@app/core/exceptions/generic.exception";
import { ErrorConstant } from "../error.constant";

export class StorageErrors {

    static __type = ErrorType.BUSINESS;

    static ERRO_SALVAR_ARQUIVO_FALTA_EMPRESA: ErrorConstant = {
        id: 11001,
        type: StorageErrors.__type,
        i18n_key: 'BSS_ERR_STORAGE_11001',
    };
    static ERRO_SALVAR_METODO_INCORRETO: ErrorConstant = {
        id: 11002,
        type: StorageErrors.__type,
        i18n_key: 'BSS_ERR_STORAGE_11002',
    };
    static ERRO_SALVAR_ARQUIVO_FALTA_USUARIO: ErrorConstant = {
        id: 11003,
        type: StorageErrors.__type,
        i18n_key: 'BSS_ERR_STORAGE_11003',
    };

}