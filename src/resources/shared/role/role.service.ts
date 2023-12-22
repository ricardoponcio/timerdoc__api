import { Role, RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

@Injectable()
export class RoleService {
    constructor(
        @InjectModel(Role)
        private roleRepository: typeof Role) { }

    findADMRole() {
        return this.roleRepository.findOne({
            where: {
                nome: RolesEnum.ADM
            }
        });
    }

    findByEnum(role: RolesEnum) {
        return this.findByName(role);
    }

    findByName(role: string) {
        return this.roleRepository.findOne({
            where: {
                nome: {
                    [Op.iLike]: role
                }
            }
        });
    }

    findByPk(roleId: number) {
        return this.roleRepository.findByPk(roleId);
    }

    findAll() {
        return this.roleRepository.findAll();
    }

}
