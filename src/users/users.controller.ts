import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';


@UseFilters(ExceptionHandling)
@Controller('api/v1')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signUp(@Body() payload : CreateUserDto){
    return this.usersService.singup(payload);
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
