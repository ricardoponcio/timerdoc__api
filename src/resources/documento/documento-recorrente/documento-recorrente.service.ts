import { TokenErrors } from '@app/core/constants/definition/errors/1xx.token.errors';
import { ReleaseErrors } from '@app/core/constants/definition/errors/4xx.release.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { DocumentoRecorrenteAnexo } from '@app/resources/documento/documento-recorrente-anexo/entities/documento-recorrente-anexo.entity';
import { DocumentoRecorrenteObservacao } from '@app/resources/documento/documento-recorrente-observacao/entities/documento-recorrente-observacao.entity';
import { DocumentoRecorrente, SituacaoEntregaEnum } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order } from 'sequelize';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';

@Injectable()
export class DocumentoRecorrenteService {

    constructor(
        @InjectModel(DocumentoRecorrente)
        private repository: typeof DocumentoRecorrente) { }

    create(createDocumentoRecorrente: DocumentoRecorrente): Promise<DocumentoRecorrente> {
        return createDocumentoRecorrente.save();
    }

    findAll(where?: Partial<DocumentoRecorrente>, order?: Order): Promise<DocumentoRecorrente[]> {
        return this.repository.findAll({ where, order, include: [
            {
                model: Usuario,
                as: 'responsavel',
            }
        ] });
    }

    findOne(where: Partial<DocumentoRecorrente>, plain = true): Promise<DocumentoRecorrente> {
        return this.repository.findOne({ where, plain });
    }

    findSameReference(docId: number, competenciaReferencia: Date): Promise<DocumentoRecorrente> {
        return this.findOne({
            competenciaReferencia,
            documentoGeralId: docId
        });
    }

    findById(id: number, extraFilter: Partial<DocumentoRecorrente> = {}, paranoid = false): Promise<DocumentoRecorrente> {
        return this.repository.findOne({
            where: { id },
            include: [
                DocumentoGeral, DocumentoRecorrenteAnexo,
                { model: DocumentoRecorrenteObservacao, include: [Usuario] },
                {
                    model: Usuario,
                    as: 'responsavel',
                }, {
                    model: Usuario,
                    as: 'usuarioUltimaAlteracao'
                }
            ], paranoid
        });
    }

    update(id: number, updateDocumentoRecorrenteDto: Partial<DocumentoRecorrente>, user: UserCompanyPayload): Promise<DocumentoRecorrente> {
        return this.repository.findByPk(id)
            .then(documentoRecorrente => documentoRecorrente.update({
                usuarioUltimaAlteracaoId: user.id,
                ...updateDocumentoRecorrenteDto
            }));
    }

    remove(id: number): Promise<void> {
        return this.repository.findByPk(id)
            .then(documentoRecorrente => documentoRecorrente.destroy());
    }

    // Others

    findOpenReleaseFromDoc(docId: number) {
        return this.repository.findOne({
            where: {
                documentoGeralId: docId,
                situacao: {
                    [Op.ne]: SituacaoEntregaEnum.ENTREGUE
                }
            }
        });
    }

    findFromDoc(docId: number): Promise<DocumentoRecorrente[]> {
        return this.repository.findAll({
            where: {
                documentoGeralId: docId
            }
        });
    }

    checkOwner(release: DocumentoRecorrente, payload: UserCompanyPayload) {
        if (!release)
            throw GenericException.fromConstant(ReleaseErrors.REGISTRO_DOCUMENTO_INVALIDO);
        if (release.documentoGeral.empresaId !== payload.sub.empresaId)
            throw GenericException.fromConstant(TokenErrors.ACAO_INVALIDA);
    }

}
