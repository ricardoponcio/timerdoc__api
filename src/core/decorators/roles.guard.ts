import { EmpresasService } from '@app/resources/shared/empresas/empresas.service';
import { RolesEnum } from '@app/resources/shared/role/entity/role.entity';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private readonly reflector: Reflector,
        @Inject(EmpresasService) private empresasService: EmpresasService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
        if (!roles) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await this.empresasService.userAndRolesValidation(user, <RolesEnum[]>roles);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}