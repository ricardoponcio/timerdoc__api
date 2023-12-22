import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioEmpresaService } from '@shared/usuario-empresa/usuario-empresa.service';

describe('UsuarioEmpresaService', () => {
  let service: UsuarioEmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioEmpresaService],
    }).compile();

    service = module.get<UsuarioEmpresaService>(UsuarioEmpresaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
