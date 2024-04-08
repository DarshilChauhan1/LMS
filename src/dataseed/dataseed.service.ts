import { Inject, Injectable } from '@nestjs/common';
import { CreateDataseedDto } from './dto/create-dataseed.dto';
import { UpdateDataseedDto } from './dto/update-dataseed.dto';
import { Model } from 'mongoose';
import { Role } from 'src/roles/entities/role.entity';
import { InjectModel } from '@nestjs/mongoose';
import { RoleEnum } from 'src/roles/enum/role.enum';

@Injectable()
export class DataseedService {
  constructor(@InjectModel('Role') private roleModel : Model<Role>){}
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
}
