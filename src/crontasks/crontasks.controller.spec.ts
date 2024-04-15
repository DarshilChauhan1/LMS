import { Test, TestingModule } from '@nestjs/testing';
import { CrontasksController } from './crontasks.controller';
import { CrontasksService } from './crontasks.service';

describe('CrontasksController', () => {
  let controller: CrontasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CrontasksController],
      providers: [CrontasksService],
    }).compile();

    controller = module.get<CrontasksController>(CrontasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
