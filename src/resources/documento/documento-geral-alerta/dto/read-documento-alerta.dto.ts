import { Expose } from "class-transformer";
import { AlertaPrioridadeEnum, AlertaTipoEnum } from "../entities/documento-geral-alerta.entity";

export class ReadDocumentoAlertaDto {

    @Expose()
    id: number;

    @Expose()
    dataHora: Date;

    @Expose()
    mensagem: string;

    @Expose()
    tipo: AlertaTipoEnum;

    @Expose()
    prioridade: AlertaPrioridadeEnum;

    @Expose()
    prioridadeOrdem: number;

    @Expose()
    resolucao: boolean;

    @Expose()
    documentoGeralId: number;

    @Expose()
    substituicaoAlertaId: number;

}
