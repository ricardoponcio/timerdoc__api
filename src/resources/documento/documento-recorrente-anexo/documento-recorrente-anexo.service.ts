import { AttachedFileEntity } from '@app/resources/documento/documento-recorrente-anexo/dto/attached-file-entity.dto';
import { DocumentoRecorrenteAnexo } from '@app/resources/documento/documento-recorrente-anexo/entities/documento-recorrente-anexo.entity';
import { DocumentoRecorrente } from '@app/resources/documento/documento-recorrente/entities/documento-recorrente.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class DocumentoRecorrenteAnexoService {

    constructor(
        @InjectModel(DocumentoRecorrenteAnexo)
        private repository: typeof DocumentoRecorrenteAnexo) { }

    create(createDocumentoRecorrenteAnexo: DocumentoRecorrenteAnexo): Promise<DocumentoRecorrenteAnexo> {
        return createDocumentoRecorrenteAnexo.save();
    }

    remove(id: number): Promise<void> {
        return this.repository.findByPk(id)
            .then(attach => attach.destroy());
    }

    buildAttaches(attaches: AttachedFileEntity[], release: DocumentoRecorrente) {
        return (attaches || []).map(attach => {
            return this.buildAttach(attach, release);
        });
    }

    buildAttach(attach: AttachedFileEntity, release: DocumentoRecorrente) {
        const attachEntity = new DocumentoRecorrenteAnexo;
        attachEntity.dataCriacao = new Date();
        attachEntity.dataAtualizacao = attachEntity.dataCriacao;
        attachEntity.nome = attach.encodedName;
        attachEntity.tipoArquivo = attach.mimetype;
        attachEntity.nomeArquivo = attach.originalname;
        attachEntity.referencia = attach.reference;
        attachEntity.documentoRecorrenteId = release.id;
        attachEntity.caminhoS3 = attach.path;
        attachEntity.bucketS3 = attach.bucket;
        attachEntity.tamanho = BigInt(attach.size);
        return attachEntity;
    }

    findAttach(id: number, documentoRecorrente: DocumentoRecorrente) {
        return this.repository.findByPk(id, {
            include: [
                { model: DocumentoRecorrente, where: { id: documentoRecorrente.id } }
            ]
        });
    }

    findByHashedNameAttach(hashedName: String, documentoRecorrente: DocumentoRecorrente) {
        return this.repository.findAll({
            where: {
                documentoRecorrenteId: documentoRecorrente.id,
                nome: {
                    [Op.like]: `%${hashedName}%`
                }
            },
            include: [
                { model: DocumentoRecorrente, where: { id: documentoRecorrente.id } }
            ]
        });
    }

}
