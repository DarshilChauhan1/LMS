import { Controller } from '@nestjs/common';
import { CrontasksService } from './crontasks.service';

@Controller('crontasks')
export class CrontasksController {
  constructor(private readonly crontasksService: CrontasksService) {}
}
