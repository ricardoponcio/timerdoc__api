import { EmpresasService } from '@app/resources/shared/empresas/empresas.service';
import { PlanosEnum } from '@app/resources/shared/planos/plano.entity';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PlansGuard implements CanActivate {

    constructor(private readonly reflector: Reflector,
        @Inject(EmpresasService) private empresasService: EmpresasService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const plans = this.reflector.get<string[]>('plans', context.getHandler());
        if (!plans) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        return new Promise<boolean>(async (resolve, reject) => {
            try {
                await this.empresasService.companyAndPlansValidation(user, <PlanosEnum[]>plans);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}