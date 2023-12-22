import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoFormularioService } from '@resources/documento/documento-formulario/documento-formulario.service';

describe('DocumentoFormularioService', () => {
  let service: DocumentoFormularioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoFormularioService],
    }).compile();

    service = module.get<DocumentoFormularioService>(DocumentoFormularioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
