import { Plano } from "./plano.entity";

export const planoProviders = [
    {
        provide: 'PLANO_REPOSITORY',
        useValue: Plano
    }
]