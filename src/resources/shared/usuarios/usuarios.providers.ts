import { Usuario } from "./entities/usuario.entity";

export const usuarioProviders = [
    {
        provide: 'USUARIO_REPOSITORY',
        useValue: Usuario
    }
]