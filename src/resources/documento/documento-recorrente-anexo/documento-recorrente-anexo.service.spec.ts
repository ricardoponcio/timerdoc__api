import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoRecorrenteAnexoService } from '@resources/documento/documento-recorrente-anexo/documento-recorrente-anexo.service';

describe('DocumentoRecorrenteAnexoService', () => {
  let service: DocumentoRecorrenteAnexoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoRecorrenteAnexoService],
    }).compile();

    service = module.get<DocumentoRecorrenteAnexoService>(DocumentoRecorrenteAnexoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
