import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { GoogleStrategy } from './strategies/google.strategy';
import { UsersService } from 'src/users/users.service';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';
import { RoleSchema } from 'src/roles/entities/role.entity';

@Module({
  imports : [MongooseModule.forFeature([{name : 'User', schema : UserSchema}, {name : 'Role', schema : RoleSchema}, {name : 'Permissions', schema : PermissionSchema}]), JwtModule, ConfigModule.forRoot()],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, UsersService],
})
export class AuthModule {}
