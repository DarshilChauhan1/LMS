import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { ResponseBody } from '../helpers/helper';
import * as bcrypt from 'bcrypt';
import { Role } from '../roles/entities/role.entity';
import { CustomError } from '../helpers/Error/customError';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai'

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @InjectModel('Role') private roleModel: Model<Role>,
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
        const userRoleId = await this.roleModel.findOne({ role: 'user' }).select('_id')

        const newUser = await this.userModel.create({ username, email, password: hashedPassword, role_id: userRoleId._id.toString() });
        return new ResponseBody(201, 'User Created Successfully', undefined, true);
      } else {
        throw new BadRequestException('All credentials are required')
      }
    } catch (error) {
      throw error
    }
  }

  async logout(userId: string) {
    try {
      const verifyUser = await this.userModel.findById(userId).select('-password -role_id');
      if (!verifyUser) throw new BadRequestException('User not found');
      verifyUser.refreshToken = '';
      await verifyUser.save();
      return new ResponseBody(200, 'Logout Successfully', undefined, true);
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


  async getRefreshToken(payload: { userId: string, refreshToken: string }) {
    try {
      const { refreshToken, userId } = payload;
      if (!refreshToken) throw new BadRequestException('Refresh Token is required');
      const findRefreshToken = await this.userModel.findById(userId).select('refreshToken');
      if (!findRefreshToken) throw new BadRequestException('User not found');

      if (findRefreshToken.refreshToken !== refreshToken) throw new BadRequestException('Invalid Refresh Token');

      const verifyToken = await this.jwtService.verifyAsync(refreshToken, { secret: this.configService.get('REFRESH_TOKEN_SECRET') });
      if (!verifyToken) throw new CustomError('Token Expired', 401, '/login')

      const accessToken = this.jwtService.sign({ id: userId }, { secret: this.configService.get('ACCESS_TOKEN_SECRET'), expiresIn: '20m' });
      return new ResponseBody(200, 'Token Refreshed Successfully', { accessToken: accessToken, refreshToken: refreshToken }, true);

    } catch (error) {
      throw error
    }
  }

  // API to get the AI response 
  async askAI(question: string) {
    try {
      const openai = new OpenAI({ apiKey: this.configService.get('OPENAI_API_KEY'), maxRetries: 3 })
      const resposnse = await openai.chat.completions.create({
        messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: question }],
        model: 'gpt-4',
      })

      return new ResponseBody(200, 'AI Response', resposnse.choices[0].message.content, true);

    } catch (error) {
      throw error
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new BadRequestException('User not found');

    } catch (error) {
      throw error
    }
  }

  async updateUser(id : string, payload : any){
      try {
        const user = await this.userModel.findById(id);
        if (!user) throw new BadRequestException('User not found');
        await this.userModel.findByIdAndUpdate(id, payload);
        return new ResponseBody(200, 'User Updated Successfully', undefined, true);
      } catch (error) {
        throw error
      }
    }
  }
