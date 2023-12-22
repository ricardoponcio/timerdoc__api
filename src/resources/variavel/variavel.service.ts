import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Variavel } from './entities/variavel.entity';
import { CreateVariavelDto } from './dto/create-variavel.dto';
import { UserCompanyPayload } from '@app/config/security/auth/user-company.payload.dto';
import { UpdateVariavelDto } from './dto/update-variavel.dto';

@Injectable()
export class VariavelService {

    constructor(@InjectModel(Variavel)
    private repository: typeof Variavel) { }

    async createVariable(userCompany: UserCompanyPayload, createVariableDto: CreateVariavelDto): Promise<Variavel> {
        const variavel = new Variavel();
        variavel.nivel = createVariableDto.nivel;
        variavel.chave = createVariableDto.chave;
        variavel.descricao = createVariableDto.descricao;
        variavel.valor = createVariableDto.valor;
        variavel.usuarioId = userCompany.id;
        variavel.empresaId = userCompany.sub.empresaId;
        variavel.documentoGeralId = createVariableDto.documentoGeralId;
        return variavel.save();
    }

    async findVariablesFromCompany(userCompany: UserCompanyPayload): Promise<Variavel[]> {
        return this.repository.findAll({
            where: {
                empresaId: userCompany.sub.empresaId
            }
        });
    }

    async findFormFromCompanyAndId(id: number, userCompany: UserCompanyPayload): Promise<Variavel> {
        return this.repository.findOne({
            where: {
                id, empresaId: userCompany.sub.empresaId
            }
        });
    }

    async update(id: number, updateVariavelDto: UpdateVariavelDto): Promise<Variavel> {
        return this.repository.findByPk(id)
            .then(variavel => variavel.update(updateVariavelDto));
    }

    async remove(id: number): Promise<void> {
        return this.repository.findByPk(id)
            .then(variavel => variavel.destroy());
    }

}
