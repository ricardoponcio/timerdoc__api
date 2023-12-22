import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralAlertaController } from '@resources/documento/documento-geral-alerta/documento-geral-alerta.controller';

describe('DocumentoGeralAlertaController', () => {
  let controller: DocumentoGeralAlertaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoGeralAlertaController],
    }).compile();

    controller = module.get<DocumentoGeralAlertaController>(DocumentoGeralAlertaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
