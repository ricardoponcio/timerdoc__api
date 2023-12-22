import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoRecorrenteService } from '@resources/documento/documento-recorrente/documento-recorrente.service';

describe('DocumentoRecorrenteService', () => {
  let service: DocumentoRecorrenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoRecorrenteService],
    }).compile();

    service = module.get<DocumentoRecorrenteService>(DocumentoRecorrenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
