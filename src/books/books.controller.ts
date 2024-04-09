import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('api/v1/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  //attribute base only for super admin
  @Get('getAll')
  getAllBooks(){
    return this.booksService.getAllBooks();
  }

  @Post('add')
  addBook(@Body() payload : CreateBookDto){
    return ""
  }
  // add a new book
  // delete book
  // update book
  
}
