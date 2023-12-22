import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralAlertaService } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.service';

describe('DocumentoGeralAlertaService', () => {
  let service: DocumentoGeralAlertaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoGeralAlertaService],
    }).compile();

    service = module.get<DocumentoGeralAlertaService>(DocumentoGeralAlertaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
