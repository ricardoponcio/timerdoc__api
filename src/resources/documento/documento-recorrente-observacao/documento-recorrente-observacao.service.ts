import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { DocumentoRecorrenteObservacao } from '@app/resources/documento/documento-recorrente-observacao/entities/documento-recorrente-observacao.entity';
import { DocumentoRecorrente } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';

@Injectable()
export class DocumentoRecorrenteObservacaoService {

    constructor(
        @InjectModel(DocumentoRecorrenteObservacao)
        private repository: typeof DocumentoRecorrenteObservacao) { }

    async create(observacao: string, usuarioId: number, documentoRecorrente: DocumentoRecorrente): Promise<DocumentoRecorrenteObservacao> {
        const newObservacao = new DocumentoRecorrenteObservacao();
        newObservacao.dataCriacao = new Date();
        newObservacao.usuarioId = usuarioId;
        newObservacao.observacao = observacao;
        newObservacao.documentoRecorrenteId = documentoRecorrente.id;
        return await newObservacao.save();
    }
}
