import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller('api/v1')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}


  // add a new book only valid for admin
  
  // delete book
  // update book
  
}
