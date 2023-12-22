import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Plano, PlanosEnum } from '@shared/planos/plano.entity';
import { Op } from 'sequelize';

@Injectable()
export class PlanosService {
  constructor(
    @InjectModel(Plano)
    private planosRepository: typeof Plano) { }

  async create(plano: Plano) {
    await plano.save();
    return plano.get({ plain: true });
  }

  async findAll() {
    return this.planosRepository.findAll();
  }

  async findByName(plan: PlanosEnum): Promise<Plano> {
    return this.planosRepository.findOne({
      where: {
        nome: {
          [Op.iLike]: plan
        }
      }
    });
  }
}
