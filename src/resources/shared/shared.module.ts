import { MinioClientModule } from '@storage/storage.module';
import { Role } from '@app/resources/shared/role/entity/role.entity';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmpresasController } from '@shared/empresas/empresas.controller';
import { EmpresasService } from '@shared/empresas/empresas.service';
import { Empresa } from '@shared/empresas/entities/empresa.entity';
import { Plano } from '@shared/planos/plano.entity';
import { PlanosController } from '@shared/planos/planos.controller';
import { planoProviders } from '@shared/planos/planos.providers';
import { PlanosService } from '@shared/planos/planos.service';
import { RoleService } from '@shared/role/role.service';
import { UsuarioEmpresa } from '@shared/usuario-empresa/entities/usuario-empresa.entity';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';
import { Usuario } from '@shared/usuarios/entities/usuario.entity';
import { UsuariosController } from '@shared/usuarios/usuarios.controller';
import { UsuariosService } from '@shared/usuarios/usuarios.service';
import { jwtConstants } from 'src/config/security/auth/constants';
import { JwtCompanyStrategy } from 'src/config/security/auth/jwt-company.strategy';
import { JwtStrategy } from 'src/config/security/auth/jwt.strategy';
import { IsCnpjUniqueConstraint } from 'src/utils/pipes/is-cnpj-unique.validador';
import { EmailModule } from '../email/email.module';
import { EmpresaController } from './empresas/empresa.controller';
import { RolesController } from './role/role.controller';
import { UsuarioEmpresaConvite } from './usuario-empresa/entities/usuario-empresa-convite.entity';
import { UsuarioEmpresaConviteController } from './usuario-empresa/usuario-empresa-convite.controller';
import { UsuarioEmpresaConviteService } from './usuario-empresa/usuario-empresa-convite.service';
import { UsuarioHashRecuperacao } from './usuarios/entities/usuario-hash-recuperacao';
import { UsuarioController } from './usuarios/usuario.controller';
import { UsuariosHashRecuperacaoService } from './usuarios/usuarios-hash-recuperacao.service';

@Module({
  imports: [
    EmailModule,
    MinioClientModule,
    SequelizeModule.forFeature([Usuario, UsuarioEmpresa, UsuarioEmpresaConvite, UsuarioHashRecuperacao, Empresa, Plano, Role]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.tmpExpiration }
    })
  ],
  controllers: [UsuariosController, UsuarioController, EmpresasController, EmpresaController, UsuarioEmpresaConviteController, RolesController, PlanosController],
  providers: [UsuariosService, EmpresasService, UsuarioEmpresaService, UsuarioEmpresaConviteService, UsuariosHashRecuperacaoService,
    JwtCompanyStrategy, JwtStrategy, IsCnpjUniqueConstraint,
    PlanosService, ...planoProviders, RoleService],
  exports: [UsuariosService, EmpresasService, UsuarioEmpresaService, UsuarioEmpresaConviteService, UsuariosHashRecuperacaoService,
    PlanosService, RoleService]
})
export class SharedModule { }