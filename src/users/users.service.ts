import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ResponseBody } from 'src/helpers/helper';

@Injectable()
export class UsersService {
  constructor(@InjectModel('User') private userModel : Model<User>){}

  async singup(userPayload: CreateUserDto) {
    try {
      const {name, username, email, password} = userPayload;
      //check if user already exists
      const verifyUser = this.userModel.findOne({$or : [{email}, {username}]});
      if(verifyUser) throw new ConflictException('User Already Exists');
      //if the user not exists create
      const newUser = await this.userModel.create({name, username, email, password});
      return new ResponseBody(201, 'User Created Successfully', newUser, true);
    } catch (error) {
      throw error
    }
  }
}
