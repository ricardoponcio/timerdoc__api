import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: RolesEnum[]) => SetMetadata('roles', roles);