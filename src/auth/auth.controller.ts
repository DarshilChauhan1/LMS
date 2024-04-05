import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { Model } from 'mongoose';
import { LoginDto } from './dto/login.do';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //login of user
  @Post('login')
  login(@Body() payload : LoginDto){
    return this.authService.login(payload);
  }
}
