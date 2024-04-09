import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { RoleEnum } from 'src/roles/enum/role.enum';
import { Permission } from 'src/permissions/entities/permission.entity';
import { AppService } from 'src/app.service';

@Injectable()
export class DataseedService {
  constructor(
    private readonly appSevice : AppService,
    @InjectModel('Permission') private permissionModel : Model<Permission>,
    @InjectModel('Role') private roleModel : Model<Role>){}
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
    const routes = this.appSevice.getAllRoutes()


    //store permissions
    for (const permission of routes) {
      const permissionObj = {
        route : permission['route']['path'],
        method : permission['route']['method'],
        role_id : [adminRole._id],
      }
      await this.permissionModel.create(permissionObj);
    }
  }
}
