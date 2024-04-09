import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { UsersModule } from 'src/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from 'src/roles/entities/role.entity';
import { Permission, PermissionSchema } from './entities/permission.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports : [MongooseModule.forFeature([{ name: Role.name, schema: RoleSchema }, {name : Permission.name, schema : PermissionSchema}, {name : 'User', schema : UserSchema}]), ConfigModule.forRoot(), JwtModule],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports : [PermissionsModule]
})
export class PermissionsModule {}
