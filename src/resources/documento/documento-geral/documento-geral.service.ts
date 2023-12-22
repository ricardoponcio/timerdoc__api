import { TokenErrors } from '@app/core/constants/definition/errors/1xx.token.errors';
import { DocumentErrors } from '@app/core/constants/definition/errors/3xx.document.errors';
import { GenericException } from '@app/core/exceptions/generic.exception';
import { DocumentoGeralAlerta } from '@app/resources/documento/documento-geral-alerta/entities/documento-geral-alerta.entity';
import { DocumentoGeral } from '@app/resources/documento/documento-geral/entities/documento-geral.entity';
import { Empresa } from '@app/resources/shared/empresas/entities/empresa.entity';
import { Usuario } from '@app/resources/shared/usuarios/entities/usuario.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UpdateDocumentoGeralDto } from '@resources/documento/documento-geral/dto/update-documento-geral.dto';
import { UserCompanyPayload } from 'src/config/security/auth/user-company.payload.dto';

@Injectable()
export class DocumentoGeralService {

  constructor(
    @InjectModel(DocumentoGeral)
    private repository: typeof DocumentoGeral) { }

  create(createDocumentoGeral: DocumentoGeral): Promise<DocumentoGeral> {
    return createDocumentoGeral.save();
  }

  findAll(where?: Partial<DocumentoGeral>): Promise<DocumentoGeral[]> {
    return this.repository.findAll({
      where, include: [
        {
          model: DocumentoGeralAlerta,
          where: {
            resolucao: false
          },
          required: false
        }, {
          model: Usuario,
          as: 'responsavel',
        }
      ]
    });
  }

  findOne(where: Partial<DocumentoGeral>, plain = true): Promise<DocumentoGeral> {
    return this.repository.findOne({ where, include: [DocumentoGeralAlerta], plain });
  }

  findById(id: number, extraFilter: Partial<DocumentoGeral> = {}, paranoid = false) {
    return this.repository.findOne({
      where: { id, ...extraFilter }, include: [
        {
          model: Usuario,
          as: 'usuario',
        }, {
          model: Usuario,
          as: 'responsavel',
        }, Empresa, DocumentoGeralAlerta
      ], paranoid
    });
  }

  findByPk(id: number) {
    return this.repository.findByPk(id);
  }

  update(id: number, updateDocumentoGeralDto: UpdateDocumentoGeralDto) {
    return this.repository.findByPk(id)
      .then(documentoGeral => documentoGeral.update(updateDocumentoGeralDto));
  }

  remove(id: number): Promise<void> {
    return this.repository.findByPk(id)
      .then(documentoGeral => documentoGeral.destroy());
  }

  checkOwner(document: DocumentoGeral, payload: UserCompanyPayload) {
    if (!document)
      throw GenericException.fromConstant(DocumentErrors.REGISTRO_INVALIDO);
    if (document.empresaId !== payload.sub.empresaId)
      throw GenericException.fromConstant(TokenErrors.ACAO_INVALIDA);
  }

}
