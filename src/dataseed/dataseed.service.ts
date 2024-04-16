import { Model } from 'mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { RoleEnum } from 'src/roles/enum/role.enum';
import { Permission } from 'src/permissions/entities/permission.entity';
import { AppService } from 'src/app.service';
import { Injectable } from '@nestjs/common';
import { Router } from 'express'
import { RoutesService } from './dataseed.interceptor';

@Injectable()
export class DataseedService {
  constructor(
    private readonly routeService : RoutesService,
    private readonly appSevice: AppService,
    @InjectModel('Permission') private permissionModel: Model<Permission>,
    @InjectModel('Role') private roleModel: Model<Role>) { }
  async dataseedRole() {
    const roles = [
      { name: RoleEnum.USER },
      { name: RoleEnum.SCHOOL_ADMIN },
      { name: RoleEnum.SUPER_ADMIN },
    ];

    for (const role of roles) {
      await this.roleModel.create({ role: role.name });
    }
  }

  async dataSeedPermission() {
    const findUserRole = await this.roleModel.findOne({ role: RoleEnum.USER });
    const adminRole = await this.roleModel.findOne({ role: RoleEnum.SCHOOL_ADMIN });
    const routes = this.routeService.getRoutes()
    console.log(routes);

    // flat map to get all the routes in a single array
    const newRoutFlatMap = routes.flatMap((route) => route['route']);
    
    const existingRoutes = await this.permissionModel.find().select('route method')
    //flat map for existing routes in permissions
    const existingRouteFlatMap = existingRoutes.flatMap((route) => route);

    // will get unique routes
    const uniqueRoutes = this.addAllUniqueRoutes(newRoutFlatMap, existingRouteFlatMap);

    // store permissions
    for (const uniqueRoute of uniqueRoutes) {
      const permissionObj = {
        route: uniqueRoute['path'],
        method: uniqueRoute['method'],
        role_id: [adminRole._id],
      }
      await this.permissionModel.create(permissionObj);
    }
  }

  private addAllUniqueRoutes(newRoutes: any[], existingRoutes: any[]) {
    const uniqueRoutes = [];
    for (const route of newRoutes) {
     existingRoutes.find((existingRoute)=> existingRoute['route'] === route['path'] && existingRoute['method'] === route['method']) == undefined ? uniqueRoutes.push(route) : null;
    }
    return uniqueRoutes;
  }
}
