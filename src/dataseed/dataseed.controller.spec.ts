import { Test, TestingModule } from '@nestjs/testing';
import { DataseedController } from './dataseed.controller';
import { DataseedService } from './dataseed.service';

describe('DataseedController', () => {
  let controller: DataseedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataseedController],
      providers: [DataseedService],
    }).compile();

    controller = module.get<DataseedController>(DataseedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
