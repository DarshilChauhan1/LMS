import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';
import { PasswordSave } from './hooks/password.hooks';

@Module({
  //Password save hook will auto encrypt password
  imports : [MongooseModule.forFeatureAsync([PasswordSave])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
