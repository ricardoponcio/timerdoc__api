import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioEmpresaConviteService } from '@shared/usuario-empresa/usuario-empresa.service';

describe('UsuarioEmpresaConviteService', () => {
  let service: UsuarioEmpresaConviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioEmpresaConviteService],
    }).compile();

    service = module.get<UsuarioEmpresaConviteService>(UsuarioEmpresaConviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
