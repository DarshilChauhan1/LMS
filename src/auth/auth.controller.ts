import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.do';
import { AuthGuard } from '@nestjs/passport';


@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //login of user
  @Post('login')
  login(@Body() payload : LoginDto){
      return this.authService.login(payload);
  }

  //google Oauth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleauth(){}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req){
    return this.authService.googleLogin(req.user);
  }

}
