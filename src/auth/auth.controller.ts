import { Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';


@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //login of user
  @UsePipes(ValidationPipe)
  @Post('login')
  login(@Body() payload : LoginDto){
      return this.authService.login(payload);
  }

  //google Oauth
  // for the activation of the google strategy
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleauth(){}

  //google redirect api for database store
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req){
    return this.authService.googleLogin(req.user);
  }

}
