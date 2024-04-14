import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, Req, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CustomGuard } from 'src/permissions/custom.guard';


@UseFilters(ExceptionHandling)
@Controller('api/v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signUp(@Body() payload : CreateUserDto){
    return this.usersService.singup(payload);
  }

  //logout
  @UseGuards(AuthGuardJWT)
  @ApiBearerAuth()
  @Post('logout')
  logout(@Req() req : Request){
    return this.usersService.logout(req['user'].id);
  }

  //getallusers
  @UseGuards(AuthGuardJWT, CustomGuard)
  @ApiBearerAuth()
  @Get('users/getall')
  getAllUsers(){
    return this.usersService.getAllUsers();
  }

  @UseGuards(AuthGuardJWT)
  @ApiBearerAuth()
  @Post('refresh')
  getRefreshToken(@Body() paylaod : {refreshToken : string}, @Req() req : Request){
    return this.usersService.getRefreshToken({userId : req['user'].id, refreshToken : paylaod.refreshToken});
  }

  @UseGuards(CustomGuard)
  @Post('forgot-password')
  forgotPassword(@Body() payload : {email : string}){
    return this.usersService.forgotPassword(payload.email);
  }

  @Put('users/:id')
  @UseGuards(AuthGuardJWT, CustomGuard)
  @ApiBearerAuth()
  updateUser(@Param('id') id : string, @Body() payload : UpdateUserDto){
    return this.usersService.updateUser(id, payload);
  }

   //Q&A with the ai
   @UseGuards(AuthGuardJWT, CustomGuard)
   @ApiBearerAuth()
   @Post('users/ask-ai')
   askAI(@Body() payload : {question : string}){
     return this.usersService.askAI(payload.question);
   } 
  //read a book
  //get marks of students with query to search for individual
  //student can see only his marks api
  //modify marks
  //student removal only valid to superadmin
  // forgot password api for everyone
  // students can see their assignments
}
