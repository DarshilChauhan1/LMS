import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseFilters, Put } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionAdminGuard } from './permissionAdmin.guard';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';


@UseFilters(ExceptionHandling)
@UseGuards(AuthGuardJWT, PermissionAdminGuard)
@Controller('api/v1/admin/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}
  
  //getAllPermissions
  @Get('getAll')
  getAllPermissions(){
    return this.permissionsService.getAllPermissions();
  }

  //TODO CHANGE POST REQUEST INTO PUT REQUEST WITH (add/:id)
  @Post('add')
  addPermissionToRoute(@Body() payload : CreatePermissionDto){
    return this.permissionsService.addPermissionToRoute(payload);
  }
  // remove roles particular permissions
  @Put('remove/:id')
  updatePermission(@Param('id') id: number, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.removeRoles(id, updatePermissionDto);
  }

  //deletes the permissions
  @Delete(':id')
  deletePermission(@Param('id') id: string) {
    return this.permissionsService.deletePermission(id);
  }
  
}
