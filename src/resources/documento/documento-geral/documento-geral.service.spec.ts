import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoGeralService } from '@resources/documento-geral/documento-geral.service';

describe('DocumentoGeralService', () => {
  let service: DocumentoGeralService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoGeralService],
    }).compile();

    service = module.get<DocumentoGeralService>(DocumentoGeralService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
