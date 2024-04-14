import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, Req } from '@nestjs/common';
import { TestsService } from './tests.service';
import { CreateTestDto } from './dto/create-test.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { CustomGuard } from 'src/permissions/custom.guard';
import { Request } from 'express';


@UseFilters(ExceptionHandling)
@UseGuards(AuthGuardJWT, CustomGuard)
@Controller('api/v1')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Post('tests/create-ai')
  createAiTest(@Req() req : Request){
    return this.testsService.createAiTest(req['user'].id);
  }
  // unit test api for individual student
  // teacher can see all tests
  // student can see thier indiviual tests
}
