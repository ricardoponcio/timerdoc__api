import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoFormularioController } from '@resources/documento/documento-formulario/documento-formulario.controller';

describe('DocumentoFormularioController', () => {
  let controller: DocumentoFormularioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentoFormularioController],
    }).compile();

    controller = module.get<DocumentoFormularioController>(DocumentoFormularioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
