import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosHashRecuperacaoService } from '@shared/usuarios/usuarios.service';

describe('UsuariosHashRecuperacaoService', () => {
  let service: UsuariosHashRecuperacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuariosHashRecuperacaoService],
    }).compile();

    service = module.get<UsuariosHashRecuperacaoService>(UsuariosHashRecuperacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
