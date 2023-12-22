import { DocumentoGeralAlerta } from "@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity";
import { PeriodicidadeEnum } from "@app/resources/documento/documento-geral/entities/documento-geral.entity";
import * as moment from "moment";
import { LocaleUtils } from "./locale.utils";
import { ObjectUtils } from "./object.utils";

export class DocumentUtils {

    static transformDataRelease = (data: Date, periodicidade: PeriodicidadeEnum, language?: string): string => {
        moment.locale(LocaleUtils.localeFromLang(language).tag);
        switch (periodicidade) {
            case PeriodicidadeEnum.DIA:
            case PeriodicidadeEnum.SEMANA:
                return moment(data).format('L');
            case PeriodicidadeEnum.MES:
            case PeriodicidadeEnum.TRIMESTRE:
            case PeriodicidadeEnum.SEMESTRE:
                return moment(data).format('MMMM/yyyy');
            case PeriodicidadeEnum.ANO:
                return moment(data).format('yyyy');
            default: return data.toISOString();
        }
    }

    static sortPriority = (first: DocumentoGeralAlerta, second: DocumentoGeralAlerta): number => {
        if (!first || !second) return 0;
        if (ObjectUtils.notNull(first.prioridadeOrdem) && ObjectUtils.notNull(second.prioridadeOrdem) && first.prioridadeOrdem !== second.prioridadeOrdem)
            return first.prioridadeOrdem - second.prioridadeOrdem;
        else if (ObjectUtils.notNull(first.dataHora) && ObjectUtils.notNull(second.dataHora) && first.dataHora.getTime() !== second.dataHora.getTime())
            return second.dataHora.getTime() - first.dataHora.getTime();
        else return second.id - first.id;
    }

}