import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateDocumentoFormularioDto } from './dto/create-documento-formulario.dto';
import { UpdateDocumentoFormularioDto } from './dto/update-documento-formulario.dto';
import { DocumentoFormulario } from './entities/documento-formulario.entity';

@Injectable()
export class DocumentoFormularioService {

    constructor(@InjectModel(DocumentoFormulario)
    private repository: typeof DocumentoFormulario) { }

    async create(userCompany: UserCompanyPayload, createDocumentoFormularioDto: CreateDocumentoFormularioDto): Promise<DocumentoFormulario> {
        const formulario = new DocumentoFormulario();
        formulario.nivel = createDocumentoFormularioDto.nivel;
        formulario.nome = createDocumentoFormularioDto.nome;
        formulario.descricao = createDocumentoFormularioDto.descricao;
        formulario.corpo = createDocumentoFormularioDto.corpo;
        formulario.usuarioId = userCompany.id;
        formulario.empresaId = userCompany.sub.empresaId;
        formulario.documentoGeralId = createDocumentoFormularioDto.documentoGeralId;
        return formulario.save();
    }

    async findFormsFromCompany(userCompany: UserCompanyPayload): Promise<DocumentoFormulario[]> {
        return this.repository.findAll({
            where: {
                empresaId: userCompany.sub.empresaId
            }
        });
    }

    async findFormFromCompanyAndId(id: number, userCompany: UserCompanyPayload): Promise<DocumentoFormulario> {
        return this.repository.findOne({
            where: {
                id, empresaId: userCompany.sub.empresaId
            }
        });
    }

    async update(id: number, updateDocumentoFormularioDto: UpdateDocumentoFormularioDto): Promise<DocumentoFormulario> {
        return this.repository.findByPk(id)
            .then(form => form.update(updateDocumentoFormularioDto));
    }

    async remove(id: number): Promise<void> {
        return this.repository.findByPk(id)
            .then(form => form.destroy());
    }

}
