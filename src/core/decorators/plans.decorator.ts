import { PlanosEnum } from '@app/resources/shared/planos/plano.entity';
import { SetMetadata } from '@nestjs/common';

export const Plans = (...plans: PlanosEnum[]) => SetMetadata('plans', plans);