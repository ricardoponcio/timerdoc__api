import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoRecorrenteObservacaoService } from '@resources/documento/documento-recorrente-observacao/documento-recorrente-observacao.service';

describe('DocumentoRecorrenteObservacaoService', () => {
  let service: DocumentoRecorrenteObservacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoRecorrenteObservacaoService],
    }).compile();

    service = module.get<DocumentoRecorrenteObservacaoService>(DocumentoRecorrenteObservacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
