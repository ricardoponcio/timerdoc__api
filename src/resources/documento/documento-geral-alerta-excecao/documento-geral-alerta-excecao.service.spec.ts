import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralAlertaExcecaoService } from '@resources/documento/documento-geral-alerta-excecao/documento-geral-alerta-excecao.service';

describe('DocumentoGeralAlertaExcecaoService', () => {
  let service: DocumentoGeralAlertaExcecaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoGeralAlertaExcecaoService],
    }).compile();

    service = module.get<DocumentoGeralAlertaExcecaoService>(DocumentoGeralAlertaExcecaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
