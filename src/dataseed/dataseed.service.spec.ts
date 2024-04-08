import { Test, TestingModule } from '@nestjs/testing';
import { DataseedService } from './dataseed.service';

describe('DataseedService', () => {
  let service: DataseedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataseedService],
    }).compile();

    service = module.get<DataseedService>(DataseedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
