import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Query, Put } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { CustomGuard } from 'src/permissions/custom.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterCustomOptions } from 'src/common/config/multer.config';
import { SearchItemsDto } from './dto/searchItems.dto';


@UseGuards(AuthGuardJWT, CustomGuard)
@Controller('api/v1')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // get all books for admins
  @Get('admin/books/getAll')
  async getAllBooks(@Query() query : SearchItemsDto) {
    return await this.booksService.getAllBooks(query);
  }

  //get book only for the user according to standard
  @Get('books/get')
  async getUserBooks(@Query() query : SearchItemsDto, @Req() req : Request) {
    return await this.booksService.getUserBooks(query, req['user'].id);
  }

  // add a new book only valid for admin
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Post('admin/books/add')
  async addBook(@Body() payload: CreateBookDto, @Req() req : Request, @UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({fileType : 'pdf'})
    .addMaxSizeValidator({maxSize : 1024 * 300 /*300 mb*/ } )
    .build({errorHttpStatusCode : HttpStatus.UNPROCESSABLE_ENTITY})
  ) file : Express.Multer.File) {
    return await this.booksService.addBook(payload, file);
  }
  // update book only valid for admin
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Put('admin/books/update/:id')
  async updateBook(@Param('id') bookId: string, @Body() payload: UpdateBookDto, @UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({fileType : 'pdf'})
    .addMaxSizeValidator({maxSize : 1024 * 300})
    .build({errorHttpStatusCode : HttpStatus.UNPROCESSABLE_ENTITY})
  ) file ?: Express.Multer.File) {
    return await this.booksService.updateBook(bookId, payload, file);
  }
  // delete book only for admin
  @Delete('admin/books/delete/:id')
  async deleteBook(@Param('id') bookId: string) {
    return await this.booksService.deleteBook(bookId);
  }
  
}
