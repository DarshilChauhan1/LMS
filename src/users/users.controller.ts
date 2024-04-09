import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { Request } from 'express';
import { CheckAbilities } from 'src/common/decorators/ability.decorator';
import { AbilityGuard } from 'src/permissions/ability.guard';
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

  //getallusers
  @UseGuards(AuthGuardJWT, CustomGuard)
  @ApiBearerAuth()
  @Get('users/getall')
  getAllUsers(){
    return this.usersService.getAllUsers();
  }

  //get all books 
  //read a book
  //Q&A with the ai
  //get marks of students with query to search for individual
  //student can see only his marks api
  //user can update their profile
  //modify marks
  //student removal only valid to superadmin
  // forgot password api for everyone
  // students can see their assignments
  //oAuth2.0 login
}
