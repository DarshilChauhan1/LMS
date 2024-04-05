import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import * as bcrypt from 'bcrypt';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './entities/user.entity';

@Module({
  //Password save hook will auto encrypt password
  imports: [MongooseModule.forFeature([{name : 'User', schema : UserSchema}])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule { }
