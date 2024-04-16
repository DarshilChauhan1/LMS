import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards } from '@nestjs/common';
import { DataseedService } from './dataseed.service';
import { CreateDataseedDto } from './dto/create-dataseed.dto';
import { UpdateDataseedDto } from './dto/update-dataseed.dto';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { ProtectedRoute } from 'src/common/decorators/UseCustomGuards.decorator';

@UseGuards(AuthGuardJWT)
@ProtectedRoute()
@Controller('dataseed')
export class DataseedController {
  constructor(private readonly dataseedService: DataseedService) {}
  @Get('roles')
  dataseedRoles(){
    return this.dataseedService.dataseedRole()
  }

  @Get('permissions')
  dataseedPermissions(){
    return this.dataseedService.dataSeedPermission()
  }
 
}
