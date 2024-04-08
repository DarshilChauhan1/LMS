import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DataseedService } from './dataseed.service';
import { CreateDataseedDto } from './dto/create-dataseed.dto';
import { UpdateDataseedDto } from './dto/update-dataseed.dto';

@Controller('dataseed')
export class DataseedController {
  constructor(private readonly dataseedService: DataseedService) {}
  @Get('roles')
  dataseedRoles(){
    return this.dataseedService.dataseedRole()
  }
 
}
