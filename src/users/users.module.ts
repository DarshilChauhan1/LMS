import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import * as bcrypt from 'bcrypt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { Role, RoleSchema } from '../roles/entities/role.entity';
import { PermissionSchema } from '../permissions/entities/permission.entity';

@Module({
  imports: [MongooseModule.forFeature([{name : 'User', schema : UserSchema}, {name : 'Role', schema : RoleSchema}, {name : 'Permissions', schema : PermissionSchema}])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
