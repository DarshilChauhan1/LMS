import { Injectable } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { User } from 'src/users/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import * as fs from 'node:fs'
import * as pdf from 'pdf-parse'
import OpenAI from 'openai';
import {DownloaderHelper} from 'node-downloader-helper'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class TestsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel('Book') private readonly bookModel: Model<Book>,
    @InjectModel('User') private readonly userModel : Model<User>,
    @InjectModel('Test') private readonly testModel : Model<Test>){}

  async createAiTest(userId : string) {
    try {
      const findUserBooks = await this.userModel.findById(userId).populate('books').select('-refreshToken -role_id -password');
      if(!findUserBooks || findUserBooks.books.length == 0) throw new Error('User has not selected any books');
      let booksIds = findUserBooks.books
      let cloudLinkPdf = []
      // extract all the cloud links of the pdfs
      for (const bookId of booksIds) {
        const cloudLinksoFPdf = await this.bookModel.findById(bookId).select('pdf');
        cloudLinkPdf.push(cloudLinksoFPdf.pdf.public_id);
      }

      console.log(cloudLinkPdf);

      cloudLinkPdf.forEach(element => {
       this.cloudinaryService.downloadPdf(element).then((res) => {
        console.log('Downloaded Successfully')
        console.log(res)
       })
       })
      // we will store the parsed document in this array
      let pdfContent = []
      // for (const link of cloudLinkPdf) {
      //   const pdfData = await pdf(fs.readFileSync(link));
      //   pdfContent.push(pdfData.text)
      //   pdfContent.push('\n')
      //   pdfContent.push('---------------------------------')
      //   pdfContent.push('New Chapter Starts Here')
      // }
      console.log(pdfContent)

    } catch (error) {
      throw error
    }
  }

}
