import { HttpException, HttpStatus } from "@nestjs/common";
import { I18nContext } from "nestjs-i18n";
import { ErrorConstant } from "../constants/definition/error.constant";

export enum ErrorType {
  BUSINESS = 'BSS'
}

export class GenericException extends HttpException {
  constructor(code: number, type: ErrorType, error?: any, fullErrorCodeFAQ?: string, extraDetail?: any) {
    super({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      type,
      errorName: fullErrorCodeFAQ,
      errorCode: code || 500,
      error: error?.message || error || 'Internal Server Error',
      detail: extraDetail
    }, HttpStatus.INTERNAL_SERVER_ERROR, {
      cause: error
    });
  }

  static fromConstant(error: ErrorConstant, extraDetail?: any): GenericException {
    const context = I18nContext.current();
    return new GenericException(error.id, error.type, context.t(`errors.${error.i18n_key}`), error.i18n_key, extraDetail);
  }
}