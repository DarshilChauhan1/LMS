import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileSchema } from './entities/profile.entity';
import { UserSchema } from 'src/users/entities/user.entity';

@Module({
  imports : [MongooseModule.forFeature([{name : 'Profile', schema : ProfileSchema}, {name : 'User', schema : UserSchema}])],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}
