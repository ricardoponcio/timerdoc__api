import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralController } from '@resources/documento/documento-geral/documento-geral.controller';
import { DocumentoGeralService } from '@resources/documento/documento-geral/documento-geral.service';

describe('DocumentoGeralController', () => {
  let controller: DocumentoGeralController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoGeralController],
      providers: [DocumentoGeralService],
    }).compile();

    controller = module.get<DocumentoGeralController>(DocumentoGeralController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
