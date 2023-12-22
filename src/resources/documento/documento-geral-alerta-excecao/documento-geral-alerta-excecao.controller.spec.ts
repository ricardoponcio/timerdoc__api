import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralAlertaExcecaoController } from '@resources/documento/documento-geral-alerta-excecao/documento-geral-alerta-excecao.controller';

describe('DocumentoGeralAlertaExcecaoController', () => {
  let controller: DocumentoGeralAlertaExcecaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoGeralAlertaExcecaoController],
    }).compile();

    controller = module.get<DocumentoGeralAlertaExcecaoController>(DocumentoGeralAlertaExcecaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
