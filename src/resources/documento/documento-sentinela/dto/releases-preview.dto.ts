import { SituacaoEntregaEnum } from "@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity";

export class ReleasesPreview {
    data !: Date;
    status !: SituacaoEntregaEnum;
    realizada !: boolean;
    entregue !: boolean;

    constructor(data: Date, status: SituacaoEntregaEnum, realizada: boolean, entregue: boolean) {
        this.data = data;
        this.status = status;
        this.realizada = realizada;
        this.entregue = entregue;
    }
}
