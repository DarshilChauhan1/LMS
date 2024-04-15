import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, Req, Put, Query } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { CustomGuard } from 'src/permissions/custom.guard';
import { Request } from 'express';
import { SubmitDto } from './dto/submit.dto';
import { QueryDto } from './dto/query.dto';


@UseFilters(ExceptionHandling)
@UseGuards(AuthGuardJWT, CustomGuard)
@Controller('api/v1')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  // automated test creation api
  // @Post('admin/tests/create-ai')
  // createAiTest(@Req() req : Request){
  //   return this.testsService.createAiTest(req['user'].id);
  // }

  //submit test api
  @Put('tests/submit/:testId')
  submitTest(@Param('testId') testId : string, @Body() payload : SubmitDto, @Req() req : Request){
    return this.testsService.submitTest(testId, payload, req['user'].id);
  }

  // getAll marks of the student api admin
  @Get('admin/tests/marks')
  getAllMarks(@Query('query') query : QueryDto){
    return this.testsService.getAllMarks(query);
  }
  // student can see thier indiviual tests give api access whenever needed
  @Get('tests/marks')
  getStudentMarks(@Req() req : Request){
    return this.testsService.getStudentMarks(req['user'].id);
  }
}
