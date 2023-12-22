import { AlertaTipoEnum } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral, PeriodicidadeEnum } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { DocumentoRecorrente, SituacaoEntregaEnum } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';
import { ReleasesPreview } from '@app/resources/documento/documento-sentinela/dto/releases-preview.dto';
import { Injectable } from '@nestjs/common';
import { DocumentoGeralAlertaService } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.service';
import { DocumentoGeralService } from '@resources/documento/documento-geral/documento-geral.service';
import { DocumentoRecorrenteService } from '@resources/documento/documento-recorrente/documento-recorrente.service';
import * as moment from 'moment';
import { DocumentoGeralAlertaExcecaoService } from '../documento-geral-alerta-excecao/documento-geral-alerta-excecao.service';
import { DocumentUtils } from '@app/utils/document.utils';
import { DateUtils } from '@app/utils/date.utils';

@Injectable()
export class DocumentoSentinelaService {

    constructor(
        private documentoGeralAlertaService: DocumentoGeralAlertaService,
        private documentoGeralService: DocumentoGeralService,
        private documentoRecorrenteService: DocumentoRecorrenteService,
        private documentoGeralAlertaExcecaoService: DocumentoGeralAlertaExcecaoService) { }

    async processDocumentsAlerts() {
        (await this.documentoGeralService.findAll() || []).map(documento => this.processDocumentAlert(documento.id));
    }

    __compareJustDates(date1: Date, date2: Date): boolean {
        return date1?.toISOString().split('T')[0] === date2?.toISOString().split('T')[0];
    }

    __transformDataRelease = (data: Date, periodicidade: PeriodicidadeEnum): String => {
        return DocumentUtils.transformDataRelease(data, periodicidade);
    }

    __isFullDateTransform = (periodicidade: PeriodicidadeEnum): boolean => {
        switch (periodicidade) {
            case PeriodicidadeEnum.DIA:
            case PeriodicidadeEnum.SEMANA:
                return true;
            case PeriodicidadeEnum.MES:
            case PeriodicidadeEnum.TRIMESTRE:
            case PeriodicidadeEnum.SEMESTRE:
            case PeriodicidadeEnum.ANO:
                return false;
            default: return null;
        }
    }

    __hasException = (preview: ReleasesPreview, document: DocumentoGeral) => {
        return this.documentoGeralAlertaExcecaoService.hasException(preview.data, document);
    }

    __isBeforeNow = (preview: ReleasesPreview) => preview.data.getTime() < new Date().getTime();

    __wasCreated = (preview: ReleasesPreview) => preview.realizada;
    __wasNotCreated = (preview: ReleasesPreview) => !preview.realizada;

    _alertProcessFunctions = [
        {
            name: 'Entregues Iniciadas porém ainda não entregue',
            fn: async (entregas: ReleasesPreview[], documento: DocumentoGeral): Promise<number> => {
                const alertaEntregaAindaAberta = await this.documentoGeralAlertaService.findOneByTypeNotResolved(documento, AlertaTipoEnum.EntregaAindaAberta);
                const abertos = entregas.filter(e => e.data.getTime() < new Date().getTime() && e.realizada && e.status != SituacaoEntregaEnum.ENTREGUE);
                const abertosCount = abertos.length;
                if (abertosCount && abertosCount > 0) {
                    const mensagemAlerta = `Documento '${documento.nome}' possui ${abertosCount} entrega(s) em aberto.`;
                    const descricaoAlerta = `Conclua as entregas referentes à ${abertos.map(e => this.__transformDataRelease(e.data, documento.periodicidade)).join(', ')}`
                    if (alertaEntregaAindaAberta == null || mensagemAlerta !== alertaEntregaAindaAberta.mensagem ||
                        descricaoAlerta !== alertaEntregaAindaAberta.descricao) {
                        this.documentoGeralAlertaService.createMinor(mensagemAlerta, descricaoAlerta, AlertaTipoEnum.EntregaAindaAberta, documento, alertaEntregaAindaAberta,
                            abertos.map(e => e.data));
                        return abertosCount;
                    } else {
                        return null;
                    }
                } else if (alertaEntregaAindaAberta) {
                    this.documentoGeralAlertaService.resolve(alertaEntregaAindaAberta);
                    return 0;
                }
            }
        }, {
            name: 'Entregues não feitas',
            fn: async (entregas: ReleasesPreview[], documento: DocumentoGeral): Promise<number> => {
                const alertaEntregaNaoRealizada = await this.documentoGeralAlertaService.findOneByTypeNotResolved(documento, AlertaTipoEnum.EntregaPendente);
                const pendentesTodos = entregas.filter(this.__isBeforeNow).filter(this.__wasNotCreated);
                const pendentesConsulta = await Promise.all(pendentesTodos.map(async e => {
                    const excecao = await this.__hasException(e, documento);
                    return {
                        ...e,
                        excecao
                    }
                }));
                const pendentes = pendentesConsulta.filter(e => !e.excecao);
                const pendentesCount = pendentes.length;
                if (pendentesCount && pendentesCount > 0) {
                    const mensagemAlerta = `Documento '${documento.nome}' possui ${pendentesCount} entrega(s) prevista(s) não entregue(s).`;
                    const descricaoAlerta = `Providencie as entregas referentes à ${pendentes.map(e => this.__transformDataRelease(e.data, documento.periodicidade)).join(', ')}`
                    if (alertaEntregaNaoRealizada == null || mensagemAlerta !== alertaEntregaNaoRealizada.mensagem ||
                        descricaoAlerta !== alertaEntregaNaoRealizada.descricao) {
                        this.documentoGeralAlertaService.createMinor(mensagemAlerta, descricaoAlerta, AlertaTipoEnum.EntregaPendente, documento, alertaEntregaNaoRealizada,
                            pendentes.map(e => e.data));
                        return pendentesCount;
                    } else {
                        return null;
                    }
                } else if (alertaEntregaNaoRealizada != null) {
                    this.documentoGeralAlertaService.resolve(alertaEntregaNaoRealizada);
                    return 0;
                }
            }
        }, {
            name: 'Entregues anteriores pendentes',
            fn: async (entregas: ReleasesPreview[], documento: DocumentoGeral): Promise<number> => {
                return null;
            }
        }, {
            name: 'Entregas próximos da data de entrega',
            fn: async (entregas: ReleasesPreview[], documento: DocumentoGeral): Promise<number> => {
                const alertaProximoDaEntrega = await this.documentoGeralAlertaService.findOneByTypeNotResolved(documento, AlertaTipoEnum.ProximoDaEntrega);
                const proximos = entregas.filter(e => e.data.getTime() >= new Date().getTime() && !e.realizada);
                const proximoCount = proximos.length;
                const proximo = proximoCount > 0 ? proximos[0] : null;

                let diasParaProximaEntrega = null;
                if (proximo) {
                    diasParaProximaEntrega = DateUtils.daysUntilDateFromNow(proximo.data);
                }

                if (proximoCount == 1 && diasParaProximaEntrega <= documento.diasAvisoVencimento) {
                    const condicaoTemporal = diasParaProximaEntrega == 0 ? 'para hoje' :
                        diasParaProximaEntrega == 1 ? 'para amanhã' :
                            `para daqui ${diasParaProximaEntrega} dias`;
                    const mensagemAlerta = `Documento '${documento.nome}' possui uma entrega prevista ${condicaoTemporal}.`;
                    const descricaoAlerta = `Providencie as entregas referentes à ${this.__transformDataRelease(proximo.data, documento.periodicidade)}${this.__isFullDateTransform(documento.periodicidade) === false ? ' - Prazo: ' + this.__transformDataRelease(proximo.data, PeriodicidadeEnum.DIA) + '' : ''}`
                    if (alertaProximoDaEntrega == null || mensagemAlerta !== alertaProximoDaEntrega.mensagem ||
                        descricaoAlerta !== alertaProximoDaEntrega.descricao) {
                        this.documentoGeralAlertaService.createMinor(mensagemAlerta, descricaoAlerta, AlertaTipoEnum.ProximoDaEntrega, documento, alertaProximoDaEntrega,
                            [proximo.data]);
                        return proximoCount;
                    } else {
                        return null;
                    }
                } else if (alertaProximoDaEntrega) {
                    this.documentoGeralAlertaService.resolve(alertaProximoDaEntrega);
                    return 0;
                }
            }
        }
    ];

    async processDocumentAlert(documentId: number): Promise<void> {
        const document: DocumentoGeral = await this.documentoGeralService.findById(documentId, {}, true);
        const entregas = await this.previewReleases(document, true);

        this._alertProcessFunctions.forEach(async ap => {
            console.log(`Processing Fn '${ap.name}'`);
            const affected = await ap.fn(entregas, document);
            const affectedFormatted = affected ? `${affected} registros foram classificados como possitivo pelo alerta` : 'Nenhum registro foi classificado como positivo';
            console.log(`Processed Fn '${ap.name}' - ${affectedFormatted}`);
        });
    }

    async previewReleases(document: DocumentoGeral, previewNextRelease: boolean = false): Promise<ReleasesPreview[]> {
        const releases: DocumentoRecorrente[] = await this.documentoRecorrenteService.findAll({
            documentoGeralId: document.id
        }, [
            ["id", "desc"]
        ]);

        let dataAtual = document.inicioContagem;
        const recorrenciaPrevista = document.recorrencia || 1;
        const entregasPrevistas: Date[] = [new Date(dataAtual.getTime())];
        while (true) {
            switch (document.periodicidade) {
                case PeriodicidadeEnum.DIA:
                    dataAtual.setDate(dataAtual.getDate() + (1 * recorrenciaPrevista));
                    break;
                case PeriodicidadeEnum.SEMANA:
                    dataAtual.setDate(dataAtual.getDate() + (7 * recorrenciaPrevista));
                    break;
                case PeriodicidadeEnum.MES:
                    dataAtual.setMonth(dataAtual.getMonth() + (1 * recorrenciaPrevista));
                    break;
                case PeriodicidadeEnum.TRIMESTRE:
                    dataAtual.setMonth(dataAtual.getMonth() + (3 * recorrenciaPrevista));
                    break;
                case PeriodicidadeEnum.SEMESTRE:
                    dataAtual.setMonth(dataAtual.getMonth() + (6 * recorrenciaPrevista));
                    break;
                case PeriodicidadeEnum.ANO:
                    dataAtual.setFullYear(dataAtual.getFullYear() + (1 * recorrenciaPrevista));
                    break;
            }
            const novaData = new Date(dataAtual.getTime());
            if ((
                    (document.fimContagem && novaData.getTime() < document.fimContagem.getTime()) ||
                    !document.fimContagem
                ) &&
                (
                    novaData.getTime() < new Date().getTime() ||
                    (previewNextRelease && entregasPrevistas[entregasPrevistas.length - 1].getTime() < new Date().getTime())
                )) {
                entregasPrevistas.push(novaData);
            } else {
                break;
            }
        }

        return entregasPrevistas.map((prevista: Date) => {
            const entregasMatch = releases.filter(r =>
                this.__compareJustDates(new Date(r.competenciaReferencia), prevista));
            return new ReleasesPreview(prevista, // Data 
                entregasMatch[0]?.situacao, // Status
                entregasMatch && entregasMatch.length > 0, // Realizada 
                entregasMatch[0]?.situacao == SituacaoEntregaEnum.ENTREGUE // Entregue
            );
        });
    }

    async checkEntregaInPreview(documentoGeral: DocumentoGeral, competenciaReferencia: Date): Promise<boolean> {
        const preview = await this.previewReleases(documentoGeral, true);
        if (!preview.some(p => this.__compareJustDates(p.data, new Date(competenciaReferencia)))) {
            return false;
        }
        return true;
    }

}
