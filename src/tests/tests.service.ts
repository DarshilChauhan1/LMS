import { BadRequestException, Injectable, Res } from '@nestjs/common';
import { CreateTestDto } from './dto/create-test.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Test } from '@nestjs/testing';
import { User } from 'src/users/entities/user.entity';
import { Book } from 'src/books/entities/book.entity';
import * as pdf from 'pdf-parse'
import OpenAI from 'openai';
import { DownloaderHelper } from 'node-downloader-helper'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { TestDocument } from './entities/test.entity';
import { TestEnum } from './enums/test.enum';
import { PipelinePagination, ResponseBody } from 'src/helpers/helper';
import { SubmitDto } from './dto/submit.dto';
import { QueryDto } from './dto/query.dto';

@Injectable()
export class TestsService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel('Book') private readonly bookModel: Model<Book>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Test') private readonly testModel: Model<Test>) { }

  async createAiTest(userId: string) {
    try {
      const findUserBooks = await this.userModel.findById(userId).populate('books').select('-refreshToken -role_id -password');
      if (!findUserBooks || findUserBooks.books.length == 0) throw new Error('User has not selected any books');

      //extract all the public ids of the pdfs
      let booksIds = findUserBooks.books.map(book => book['pdf']['publicId']);
      let testData = [];
      // get all the data from the pdf's
      for (const bookId of booksIds) {
        const fileBuffer = await this.cloudinaryService.downloadPdf(bookId);
        try {
          const pdfData = await pdf(fileBuffer);
          testData.push(pdfData.text);
        } catch (error) {
          throw error
        }
      }

      console.log(testData)
      // asking open ai questions
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 25 MCQ Based on the description below with 4 options seperately and after that I want you to create a seperate questions object with same questions and answers object of all that questions and use **Answers:** to sepearte answers'
          },
          {
            role: 'user',
            content: testData.join('')
          }
        ]
      })
      let arrayOfResponse = response.choices[0].message.content.split('**Answers:**')
      let questions = arrayOfResponse[0].split('\n').map(question => question[0]);
      let answers = arrayOfResponse[1].split('\n');

      const testDataToStore = {
        name: TestEnum.UNIT_TEST,
        description: 'Weekly Unit Test',
        questions: questions,
        answers: answers,
        book_id: findUserBooks.books['_id'],
        student_id: findUserBooks['_id'],
      }

      //storing the data to the database
      await this.testModel.create(testDataToStore)
      const responseData = {
        mcq: arrayOfResponse[0],
        answers: answers
      }
      return new ResponseBody(201, 'Test Created Successfully', responseData, true)

    } catch (error) {
      throw error
    }
  }

  async submitTest(testId: string, payload: SubmitDto, userId : string) {
    try {
      let {marks, test, totalMarks,timeTaken} = payload;
      const findTest = await this.testModel.findById(testId);
      // verify if the test exists
      if(!findTest) throw new BadRequestException('Test not found');
      // verify if valid user is submitting the test
      if(findTest['student_id'] != userId) throw new BadRequestException('You are not allowed to submit this test');
      // verify if the test is already submitted
      if(findTest['submitted']) throw new BadRequestException('Test already submitted')

      const saveDataToTest = {
        name : test,
        test_total_marks : totalMarks,
        user_obtained_mark : marks,
        student_id : userId,
        submitted : true,
        time_taken : timeTaken
      }

      // save the data to the Test Collection
      await this.testModel.findByIdAndUpdate(testId, saveDataToTest, {new : true})

      return new ResponseBody(200, 'Test Submitted Successfully', null, true)
    } catch (error) {
      throw error
    }
  }

  async getAllMarks(query : QueryDto) {
    try {
      const {search, limit, page, filter, order_by} = query
      let skipPages = (page ? (parseInt(page) - 1) : 0) * (parseInt(limit) ? parseInt(limit) : 10)
      const pipeline: any = [
        {
          $match: {
            submitted : true
          }
        },
        {
          $group: {
            _id: '$student_id',
            total_marks: { $sum: '$test_total_marks' },
            total_marks_obtained: { $sum: '$user_obtained_mark' }
          }
        },
        {
          $lookup: {
            from : 'books',
            localField : '_id',
            foreignField : 'book_id',
            as : 'book'
          }
        }
      ]

      // only for searching
      if(search){
        pipeline.push({
          $lookup : {
            from : 'profiles',
            localField : 'student_id',
            foreignField : 'student_id',
            as : 'student'
          },
          $match : {
            $or : [
              { 'student.firstname' : { $regex : search, $options : 'i'}},
              { 'student.lastname' : { $regex : search, $options : 'i'}}
            ]
          }
        })
      }

      // only for filtering
      if(filter){
        pipeline.push({
          $match : {
            name : filter
          }
        })
      }
      const pagination = PipelinePagination(skipPages, limit, order_by)
      pipeline.push(...pagination)
      // for calculating total documents
      const totalDocuments = await this.testModel.aggregate([{$match : {submitted : true}}, {$count : 'total'}])
      const getAllMarks = await this.testModel.aggregate(pipeline);

      const responseData = {
        totalDocuments : totalDocuments.length > 0 ? totalDocuments[0].total : 0,
        data : getAllMarks
      }

      return new ResponseBody(200, 'All Marks Received', responseData, true)

    } catch (error) {
      throw error
    }
  }

  async getStudentMarks(studentId : string) {
    try {
      const pipeline = [
        {
          $match : {
            student_id : studentId
          }
        },
        {
          $match : {
            submitted : true
          }
        },
        {
          $group : {
            _id : '$student_id',
            total_marks : { $sum : '$test_total_marks'},
            total_marks_obtained : { $sum : '$user_obtained_mark'}
          }
        }
      ]

      const getUserMarks = await this.testModel.aggregate(pipeline);
      
    } catch (error) {
      throw error
    }
  }

}
