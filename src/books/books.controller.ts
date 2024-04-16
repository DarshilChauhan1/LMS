import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Query, Put } from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { AuthGuardJWT } from 'src/auth/auth.guard';
import { CustomGuard } from 'src/permissions/custom.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterCustomOptions } from 'src/common/config/multer.config';
import { SearchItemsDto } from './dto/searchItems.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { getFileValidator } from 'src/books/file.validator';
import { GuardName } from 'src/common/decorators/guardName.decorator';


@UseGuards(AuthGuardJWT, CustomGuard)
@ApiBearerAuth()
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
  async addBook(@Body() payload: CreateBookDto, @Req() req : Request, @UploadedFile(getFileValidator()) file: Express.Multer.File){
    return await this.booksService.addBook(payload, file);
  }
  // update book only valid for admin
  @UseInterceptors(FileInterceptor('file', MulterCustomOptions))
  @Put('admin/books/:id')
  async updateBook(@Param('id') bookId: string, @Body() payload: UpdateBookDto, @UploadedFile(
    new ParseFilePipeBuilder()
    .addFileTypeValidator({fileType : 'pdf jpg jpeg png'})
    .addMaxSizeValidator({maxSize : 1024 * 1024 * 300 /*300 mb*/})
    .build({errorHttpStatusCode : HttpStatus.UNPROCESSABLE_ENTITY})
  ) file ?: Express.Multer.File) {
    return await this.booksService.updateBook(bookId, payload, file);
  }
  // delete book only for admin
  @Delete('admin/books/:id')
  async deleteBook(@Param('id') bookId: string) {
    return await this.booksService.deleteBook(bookId);
  }


    /* user dashboard books api's*/
  
  //select books to  start your reading
  @Post('books/select')
  async selectBook(@Body() payload : {books : string[]}, @Req() req : Request){
    return await this.booksService.selectBook(payload.books, req['user'].id);
  }

  // get all selected user books or get reading list
  @Get('books/selected')
  async getSelectedBooks(@Req() req : Request){
    return await this.booksService.getSelectedBooks(req['user'].id);
  }

  //deselect books from the selected books  or to remove books from the reading list
  @Post('books/deselect')
  async deselectBook(@Body() payload : {books : string[]}, @Req() req : Request){
    return await this.booksService.deselectBook(payload.books, req['user'].id);
  }
}
