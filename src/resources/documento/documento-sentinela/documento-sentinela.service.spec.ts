import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoSentinelaService } from '@resources/documento/documento-sentinela/documento-sentinela.service';

describe('DocumentoSentinelaService', () => {
  let service: DocumentoSentinelaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentoSentinelaService],
    }).compile();

    service = module.get<DocumentoSentinelaService>(DocumentoSentinelaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
