import { Role } from "./entity/role.entity";

export const planoProviders = [
    {
        provide: 'ROLE_REPOSITORY',
        useValue: Role
    }
]