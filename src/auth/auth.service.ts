import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ResponseBody } from 'src/helpers/helper';
import { PlatformEnum } from 'src/users/enum/platform.enum';
import { GoogleLogin } from './dto/googleLogin.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService : JwtService,
        private configService: ConfigService,
        @InjectModel('User') private userModel: Model<User>) {}
    async login(payload: LoginDto) {
        try {
            const { password, username, platform_field } = payload
            if (username && password && platform_field == PlatformEnum.APPLICATION) {
                const user = await this.userModel.findOne({ username }).select('+password');
                if (!user) throw new NotFoundException('User not found')
                const isMatchPasswrord = await bcrypt.compare(password, user.password);
                if (!isMatchPasswrord) throw new UnauthorizedException('Password is incorrect')
                //assign new tokens
                let access_token = await this.generateAccessToken(user._id.toString())
                let refresh_token = await this.generateRefreshToken(user._id.toString())
                user.refreshToken = refresh_token
                await user.save()
                const responseData = {
                    access_token : access_token,
                    refresh_token : refresh_token,
                    user : {
                        _id : user._id,
                        username : user.username,
                        email : user.email
                    }
                }
                return new ResponseBody(200, 'Login successfully', responseData, true)
            } else {
                throw new BadRequestException('All fields are required')
            }
        } catch (error) {
            throw error
        }
    }

    async googleLogin(payload : GoogleLogin){
        console.log(payload);
        try {
            const {username, email} = payload;
            const user = await this.userModel.findOne({$or : [{email}, {username}], platform_field : PlatformEnum.GOOGLE});
            console.log(user);
            let responseData = {};
            if(user){
               responseData['user'] = user
            }
            // if user doesnot exists we create one
            const newUser = await this.userModel.create({...payload, platform_field : PlatformEnum.GOOGLE});
            console.log(newUser)
            responseData['user'] = newUser
            const access_token = await this.generateAccessToken(newUser._id.toString());
            const refresh_token = await this.generateRefreshToken(newUser._id.toString());
            responseData['access_token'] = access_token;
            responseData['refresh_token'] = refresh_token;

            return new ResponseBody(201, 'User Created Successfully', responseData, true);
        } catch (error) {
            console.log(error);
        }
    }


    private async generateAccessToken(_id : string){
        let accessToken = await this.jwtService.signAsync({id : _id}, {secret : this.configService.get('ACCESS_TOKEN_SECRET'),expiresIn : '20m'});
        return accessToken
    }

    private async generateRefreshToken(_id : string){
        let refreshToken = await this.jwtService.signAsync({id : _id}, {secret : this.configService.get('REFRESH_TOKEN_SECRET'),expiresIn : '1d'});
        return refreshToken
    }
}
