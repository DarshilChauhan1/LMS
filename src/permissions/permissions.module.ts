import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/entities/role.entity';
import { Permission, PermissionSchema } from './entities/permission.entity';

@Module({
  imports : [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }, {name : Permission.name, schema : PermissionSchema}])],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports : [PermissionsModule]
})
export class PermissionsModule {}
