import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioEmpresaConviteController } from '@shared/usuario-empresa/usuarios-empresa-convite.controller';
import { UsuariosService } from '@shared/usuarios/usuarios.service';

describe('UsuarioEmpresaConviteController', () => {
  let controller: UsuarioEmpresaConviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioEmpresaConviteController],
      providers: [UsuariosService],
    }).compile();

    controller = module.get<UsuarioEmpresaConviteController>(UsuarioEmpresaConviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
