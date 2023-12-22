import { Empresa } from "./entities/empresa.entity";

export const planoProviders = [
    {
        provide: 'EMPRESA_REPOSITORY',
        useValue: Empresa
    }
]