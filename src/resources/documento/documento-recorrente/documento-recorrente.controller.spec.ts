import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoRecorrenteController } from '@resources/documento/documento-recorrente/documento-recorrente.controller';

describe('DocumentoRecorrenteController', () => {
  let controller: DocumentoRecorrenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoRecorrenteController],
    }).compile();

    controller = module.get<DocumentoRecorrenteController>(DocumentoRecorrenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
