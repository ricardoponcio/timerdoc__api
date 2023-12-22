import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { ReadSimpleUser } from '../shared/usuarios/dto/read-simple-usuario.dto';
import { Usuario } from '../shared/usuarios/entities/usuario.entity';
import { ModelHistoryChangeTypeDto } from './dto/model-history-change-type.dto';
import { ModelHistoryDto } from './dto/model-history.dto';
import { Auditoria, AuditoriaOperacaoEnum } from './entities/auditoria.entity';
const diff = require('deep-diff').diff;
const format = require('date-format');

@Injectable()
export class AuditoriaService {

  constructor(
    @InjectModel(Auditoria)
    private repository: typeof Auditoria) { }

  async findHistory(model: any): Promise<ModelHistoryDto[]> {
    const history = await this.repository.findAll({
      where: {
        tableName: model.constructor?.tableName,
        entityId: model.id
      },
      include: [Usuario]
    });

    if (!history || history.length === 0)
      return null;

    return history
      .map(h => h.get({ plain: true }))
      .map((h, idx, array) => {
        let changes: any[] = [];
        if (idx > 0) {
          const previousData = JSON.parse(array[idx - 1].entidade);
          const newData = JSON.parse(h.entidade);
          changes = diff(previousData, newData) || [];
        }
        const changeType: ModelHistoryChangeTypeDto = {
          type: h.operacao === AuditoriaOperacaoEnum.INSERT ? 'INSERT' :
            h.operacao === AuditoriaOperacaoEnum.UPDATE ? 'UPDATE' :
              h.operacao === AuditoriaOperacaoEnum.DELETE ? 'DELETE' :
                null,
          description: h.operacao === AuditoriaOperacaoEnum.INSERT ? 'Inserção de registro na base de dados' :
            h.operacao === AuditoriaOperacaoEnum.UPDATE ? 'Alteração de atributos' :
              h.operacao === AuditoriaOperacaoEnum.DELETE ? 'Remoção do registro da base' :
                null,
        };
        return {
          date: h.dataCriacao,
          changedBy: plainToClass(ReadSimpleUser, instanceToPlain(h.user, { excludeExtraneousValues: true })),
          changeType,
          changes: changes
            .filter(c => c.kind === 'E')
            .filter(c => c.path.join('.') != 'createdAt')
            .filter(c => c.path.join('.') != 'updatedAt')
            .filter(c => c.path.join('.') != 'deletedAt')
            .map(c => {
              return {
                attribute: c.path.join('.'),
                previousValue: c.lhs,
                newValue: c.rhs
              }
            })
        }
      });
  }

  __searchTransformOpportunity(value: any) {
    if (Number.isInteger(value)) return +value; // 5.0
    if (value.toString().match(/\d{4}-(?:0[1-9]|1[0-2])-(?:[0-2][1-9]|[1-3]0|3[01])T(?:[0-1][0-9]|2[0-3])(?::[0-6]\d)(?::[0-6]\d)?(?:\.\d{3})?(?:[+-][0-2]\d:[0-5]\d|Z)?/))
      return format('dd/MM/yyyy hh:mm:ss', new Date(value.toString())); // 2023-06-14T12:17:27.194Z
    return value;
  }

}
