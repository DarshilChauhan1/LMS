import { Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(@InjectModel('Book') private readonly bookModel : Model<Book>) {}

  async getAllBooks(){
    return await this.bookModel.find();
  }
}
