import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { Role, RoleSchema } from '../roles/entities/role.entity';
import { PermissionSchema } from '../permissions/entities/permission.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from 'src/roles/roles.module';
import { RolesService } from 'src/roles/roles.service';
import { PermissionsModule } from 'src/permissions/permissions.module';

@Module({
  imports: [MongooseModule.forFeature([{name : 'User', schema : UserSchema}, {name : 'Role', schema : RoleSchema}, {name : 'Permission', schema : PermissionSchema}]), ConfigModule, JwtModule, PermissionsModule],
  controllers: [UsersController],
  providers: [UsersService, RolesService],
  exports: [UsersService]
})
export class UsersModule { }
