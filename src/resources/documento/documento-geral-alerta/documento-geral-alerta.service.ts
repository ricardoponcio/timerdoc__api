import { AlertaPrioridadeEnum, AlertaTipoEnum, DocumentoGeralAlerta } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral, PeriodicidadeEnum } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { DateUtils } from '@app/utils/date.utils';
import { DocumentUtils } from '@app/utils/document.utils';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { I18nContext } from 'nestjs-i18n';
import { DocumentoGeralAlertaCompetencia } from './entities/documento-geral-alerta-competencia.entity';

@Injectable()
export class DocumentoGeralAlertaService {
    constructor(
        @InjectModel(DocumentoGeralAlerta)
        private repository: typeof DocumentoGeralAlerta,
        @InjectModel(DocumentoGeralAlertaCompetencia)
        private repositoryCompetencia: typeof DocumentoGeralAlertaCompetencia) { }

    async create(createDocumentoGeralAlerta: DocumentoGeralAlerta, competencias?: Date[]): Promise<DocumentoGeralAlerta> {
        const created = await createDocumentoGeralAlerta.save();
        await Promise.all(competencias?.map(c => {
            const competencia = new DocumentoGeralAlertaCompetencia();
            competencia.competenciaReferencia = c;
            competencia.documentoGeralAlertaId = created.id;
            return competencia;
        }).map(async c => c.save()));
        return created;
    }

    createMinor(mensagemAlerta: string, descricaoAlerta: string, alertaTipo: AlertaTipoEnum, documento: DocumentoGeral, substituicao: DocumentoGeralAlerta, competencias?: Date[]): Promise<DocumentoGeralAlerta> {
        let prioridade !: AlertaPrioridadeEnum;
        let prioridadeOrdem !: number;

        switch (alertaTipo) {
            case AlertaTipoEnum.DocumentoFaltante:
                prioridade = AlertaPrioridadeEnum.WARN;
                prioridadeOrdem = 2;
                break;
            case AlertaTipoEnum.EntregaAindaAberta:
                prioridade = AlertaPrioridadeEnum.WARN;
                prioridadeOrdem = 1;
                break;
            case AlertaTipoEnum.EntregaPendente:
                prioridade = AlertaPrioridadeEnum.ERRO;
                prioridadeOrdem = 0;
                break;
            case AlertaTipoEnum.ProximoDaEntrega:
                prioridade = AlertaPrioridadeEnum.INFO;
                prioridadeOrdem = 2;
                break;
            default:
                prioridade = AlertaPrioridadeEnum.INFO;
                prioridadeOrdem = 99;
        }

        const novoAlerta = new DocumentoGeralAlerta();
        novoAlerta.dataHora = new Date();
        novoAlerta.mensagem = mensagemAlerta;
        novoAlerta.descricao = descricaoAlerta;
        novoAlerta.tipo = alertaTipo;
        novoAlerta.prioridade = prioridade;
        novoAlerta.prioridadeOrdem = prioridadeOrdem;
        novoAlerta.resolucao = false;
        novoAlerta.documentoGeralId = documento.id;
        if (substituicao != null) {
            // Resolvo o alerta anterior
            substituicao.resolucao = true;
            this.update(substituicao);
            // Adiciono para o novo uma substituição do anterior
            novoAlerta.substituicaoAlertaId = substituicao.id;
        }
        return this.create(novoAlerta, competencias);
    }

    resolve(resolveAlerta: DocumentoGeralAlerta): Promise<DocumentoGeralAlerta> {
        resolveAlerta.resolucao = true;
        return resolveAlerta.save();
    }

    update(updateDocumentoGeralAlerta: DocumentoGeralAlerta): Promise<DocumentoGeralAlerta> {
        return updateDocumentoGeralAlerta.save();
    }

    findOneByTypeNotResolved(documentoGeral: DocumentoGeral, tipo: AlertaTipoEnum): Promise<DocumentoGeralAlerta> {
        return this.repository.findOne({
            where: {
                documentoGeralId: documentoGeral.id,
                tipo,
                resolucao: false
            }, plain: true
        });
    }

    findAllByDocumentsFromCompany(empresaId: number) {
        return this.repository.findAll({
            where: {
                resolucao: false
            },
            include: [
                {
                    model: DocumentoGeral,
                    where: {
                        empresaId
                    }
                },
                DocumentoGeralAlertaCompetencia
            ]
        });
    }

    traduzir(documentoGeralAlerta: DocumentoGeralAlerta): DocumentoGeralAlerta {
        const context = I18nContext.current();
        const alertName = documentoGeralAlerta.tipo === AlertaTipoEnum.EntregaAindaAberta ? "ENTREGA_AINDA_ABERTA" :
            documentoGeralAlerta.tipo === AlertaTipoEnum.EntregaPendente ? "ENTREGA_PENDENTE" :
                documentoGeralAlerta.tipo === AlertaTipoEnum.ProximoDaEntrega ? "PROXIMO_DA_ENTREGA" : null;
        if (alertName == null) documentoGeralAlerta;

        documentoGeralAlerta.mensagem = this.#substituirParametros(documentoGeralAlerta, context.t(`document-alerts.MESSAGE_${alertName}`));
        documentoGeralAlerta.descricao = this.#substituirParametros(documentoGeralAlerta, context.t(`document-alerts.DESCRIPTION_${alertName}`));
        return documentoGeralAlerta;
    }

    #substituirParametros(documentoGeralAlerta: DocumentoGeralAlerta, message: string) {
        const context = I18nContext.current();
        return message
            .replaceAll('${documento}', documentoGeralAlerta.documentoGeral.nome)
            .replaceAll('${count}', documentoGeralAlerta.competencias.length.toString())
            .replaceAll('${competencias}', documentoGeralAlerta.competencias
                ?.map(c => DocumentUtils.transformDataRelease(c.competenciaReferencia, documentoGeralAlerta.documentoGeral.periodicidade, context.lang))
                .join(', '))
            .replaceAll('${competencia}', DocumentUtils.transformDataRelease(documentoGeralAlerta.competencias[0].competenciaReferencia,
                documentoGeralAlerta.documentoGeral.periodicidade, context.lang))
            .replaceAll('${prazoRelativo}', DateUtils.relativeTransformation(
                DateUtils.daysUntilDateFromNow(documentoGeralAlerta.competencias[0].competenciaReferencia),
                [
                    { daysLeft: 0, transformTo: context.t(`utils.FOR_TODAY`) },
                    { daysLeft: 1, transformTo: context.t(`utils.FOR_TOMORROW`) },
                ], (daysLeft: number) => context.t(`utils.FOR_X_DAYS`).replaceAll('${dias}', daysLeft.toString())
            ))
            .replaceAll('${prazo}', DocumentUtils.transformDataRelease(documentoGeralAlerta.competencias[0].competenciaReferencia,
                PeriodicidadeEnum.DIA, context.lang));
    }
}
