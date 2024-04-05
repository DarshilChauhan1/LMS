import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.do';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService : JwtService,
        private configService: ConfigService,
        @InjectModel('User') private userModel: Model<User>) { }
    async login(payload: LoginDto) {
        try {
            const { password, username } = payload
            if (username && password) {
                const user = await this.userModel.findOne({ username }).select('+password');
                if (!user) throw new NotFoundException('User not found')
                const isMatchPasswrord = await bcrypt.compare(password, user.password);
                if (!isMatchPasswrord) throw new UnauthorizedException('Password is incorrect')
                let access_token = await this.jwtService.signAsync({id : user._id}, {secret : this.configService.get('ACCESS_TOKEN_SECRET'),expiresIn : '20m'});
                let refresh_token = await this.jwtService.signAsync({id : user._id}, {secret : this.configService.get('REFRESH_TOKEN_SECRET'),expiresIn : '1d'});
                user.refreshToken = refresh_token
                await user.save()
            } else {
                throw new BadRequestException('All fields are required')
            }
        } catch (error) {
            throw error
        }
    }
}
