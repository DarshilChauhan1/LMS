import { Module } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './entities/book.entity';

@Module({
  imports : [MongooseModule.forFeature([{name : 'Book', schema : BookSchema}])],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
