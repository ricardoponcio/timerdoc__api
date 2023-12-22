import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { UserPayload } from '@app/config/security/auth/user.payload.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentoGeralAlertaExcecao } from '../documento-geral-alerta-excecao/entities/documento-geral-alerta-excecao.entity';
import { DocumentoGeralAlerta } from '../documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral } from '../documento-geral/entities/documento-geral.entity';

@Injectable()
export class DocumentoGeralAlertaExcecaoService {
    constructor(
        @InjectModel(DocumentoGeralAlertaExcecao)
        private repository: typeof DocumentoGeralAlertaExcecao) { }

    create(competenciaReferenciaExcecao: Date, documentoGeral: DocumentoGeral, usuarioLogado: UserPayload | UserCompanyPayload, documentoGeralAlerta?: DocumentoGeralAlerta) {
        const excecao = new DocumentoGeralAlertaExcecao();
        excecao.dataCriacao = new Date();
        excecao.competenciaReferenciaExcecao = competenciaReferenciaExcecao;
        excecao.documentoGeralId = documentoGeral.id;
        excecao.documentoGeralAlertaId = documentoGeralAlerta?.id;
        excecao.usuarioCriacaoId = usuarioLogado.id;
        excecao.dataRemocao = null;
        return excecao.save();
    }

    remove(competenciaReferenciaExcecao: Date, documentoGeral: DocumentoGeral) {
        return this.repository.findOne({
            where: {
                competenciaReferenciaExcecao,
                documentoGeralId: documentoGeral.id
            }
        }).then(excecao => !excecao ? null : excecao.destroy());
    }

    listByDocument(documentoGeral: DocumentoGeral) {
        return this.repository.findAll({
            where: {
                documentoGeralId: documentoGeral.id
            }
        });
    }

    async hasException(competenciaReferenciaExcecao: Date, documentoGeral: DocumentoGeral): Promise<boolean> {
        const excecao = await this.repository.findOne({
            where: {
                competenciaReferenciaExcecao,
                documentoGeralId: documentoGeral.id
            }
        });
        return !!excecao;
    }

}
