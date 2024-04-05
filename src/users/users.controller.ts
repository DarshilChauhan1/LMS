import { Controller, Get, Post, Body, Patch, Param, Delete, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExceptionHandling } from 'src/common/filters/excpetion.filter';


@UseFilters(ExceptionHandling)
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  signUp(@Body() payload : CreateUserDto){
    return this.usersService.singup(payload);
  }

}
