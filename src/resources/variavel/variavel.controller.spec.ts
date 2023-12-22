import { Test, TestingModule } from '@nestjs/testing';
import { VariavelController } from '@resources/variavel/variavel.controller';

describe('VariavelController', () => {
  let controller: VariavelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariavelController],
    }).compile();

    controller = module.get<VariavelController>(VariavelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
