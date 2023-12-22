import { Test, TestingModule } from '@nestjs/testing';
import { VariavelService } from '@resources/variavel/variavel.service';

describe('VariavelService', () => {
  let service: VariavelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariavelService],
    }).compile();

    service = module.get<VariavelService>(VariavelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
