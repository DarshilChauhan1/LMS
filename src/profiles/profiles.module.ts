import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from './entities/profile.entity';
import { UserSchema } from 'src/users/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PermissionSchema } from 'src/permissions/entities/permission.entity';

@Module({
  imports : [MongooseModule.forFeature([{name : 'Profile', schema : ProfileSchema}, {name : 'User', schema : UserSchema}, {name : 'Permission', schema : PermissionSchema}]), ConfigModule.forRoot(), JwtModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
