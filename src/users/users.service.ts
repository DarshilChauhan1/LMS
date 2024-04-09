import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ResponseBody } from 'src/helpers/helper';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('Role') private roleModel : Model<Role>,
    @InjectModel('User') private userModel: Model<User>) { }

  async singup(userPayload: CreateUserDto) {
    const { username, email, password } = userPayload;
    try {
      if (username && email && password) {
        //check if user already exists
        const verifyUser = await this.userModel.findOne({ $or: [{ email }, { username }] });
        if (verifyUser) throw new ConflictException('User Already Exists');
        //if the user not exists create
        let hashedPassword = await bcrypt.hash(password, 10);
        const userRoleId = await this.roleModel.findOne({role : 'user'}).select('_id')
        
        const newUser = await this.userModel.create({ username, email, password: hashedPassword, role_id : userRoleId._id.toString()});
        return new ResponseBody(201, 'User Created Successfully', undefined, true);
      } else {
        throw new BadRequestException('All credentials are required')
      }
    } catch (error) {
      throw error
    }
  }

  async getAllUsers() {
    try {
      const getAllUsers = await this.userModel.find();
      return new ResponseBody(200, 'Users Fetched Successfully', getAllUsers, true);
      
    } catch (error) {
      throw error
    }
  }
}
