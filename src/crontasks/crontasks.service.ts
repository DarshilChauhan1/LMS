import { Injectable, Logger, Req } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TestsService } from 'src/tests/tests.service';

@Injectable()
export class CrontasksService {
    constructor(private readonly testService : TestsService){}
    private readonly logger = new Logger(CrontasksService.name);

    // Todo functionality to create unit test even if the user is logged out
    @Cron('0 0 12 * * 1')
    handleCron(@Req() req : Request) {
        this.testService.createAiTest(req['user'].id);
    }
}
