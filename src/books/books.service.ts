import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from './entities/book.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ResponseBody } from 'src/helpers/helper';
import { SearchItemsDto } from './dto/searchItems.dto';
import { User } from 'src/users/entities/user.entity';
import { Profile } from 'src/profiles/entities/profile.entity';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel('Profile') private readonly profileModel: Model<Profile>,
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Book') private readonly bookModel: Model<Book>) { }

  async getAllBooks(query: SearchItemsDto) {
    try {
      // we can also add limit dynamically
      const { search, order_by, filter, page, limit } = query;

      // Pagination
      const skipPages = page ? (parseInt(page) - 1) * parseInt(limit) ? parseInt(limit) : 10 : 0
      const pipeline: any = [
        {
          $match: {
            isDeleted : false
          }
        },
        {
          $match : {
            $text : {
              $search : search ? search : ""
            }
          }
        },
        {
          $match : {
            $or : [
              {author : filter ? filter : ""},
            ]
          }
        },
        {
          $match : {
            $sort : {
              createdAt : order_by == 'asc' ? 1 : -1
            }
          }
        },
        {
          $skip : skipPages
        },
        {
          $limit : parseInt(limit) ? parseInt(limit) : 10
        }
      ];
      // for search filter and order by functionality in the books
      const getAllBooks = await this.bookModel.aggregate(pipeline);
      return new ResponseBody(200, 'All books', getAllBooks, true);
    } catch (error) {
      throw error
    }
  }

  async getUserBooks(query : SearchItemsDto, userId : string){
    try {
      const getUserStandard = await this.profileModel.findOne({student_id : userId});
      if(!getUserStandard) throw new ConflictException('User not found');
      const {search, order_by, filter, page, limit} = query

      const skipPages = page ? (parseInt(page) - 1) * parseInt(limit) ? parseInt(limit) : 10 : 0

      const pipeline : any = [
        {
          $match: {
            isDeleted : false
          }
        },
        {
          $match : {
            standard : getUserStandard.standard
          }
        },
        {
          $match : {
            $text : {
              $search : search ? search : ""
            }
          }
        },
        {
          $match : {
            $or : [
              {author : filter ? filter : ""},
            ]
          }
        },
        {
          $match : {
            $sort : {
              createdAt : order_by == 'asc' ? 1 : -1
            }
          }
        },
        {
          $skip : skipPages
        },
        {
          $limit : parseInt(limit) ? parseInt(limit) : 10
        }
      ]
      // for search filter and order by functionality in the books
      const getAllUserBooks = await this.bookModel.aggregate(pipeline);
    } catch (error) {
      throw error
    }
  }
  async addBook(payload: CreateBookDto, file: Express.Multer.File) {
    try {
      const { author, description, standard, title } = payload;
      const findBook = await this.bookModel.findOne({ title });
      if (findBook) throw new ConflictException('Book already exists');
      if (!file) throw new ConflictException('Please upload a file');
      const cloudinaryUpload = await this.cloudinaryService.uploadImage(file.path);
      const newBook = await this.bookModel.create({
        author,
        description,
        standard,
        title,
        pdf: {
          url: cloudinaryUpload.secure_url,
          publicId: cloudinaryUpload.public_id
        }
      });

      return new ResponseBody(201, 'Book added successfully', newBook, true)

    } catch (error) {
      throw error
    }
  }

  async updateBook(bookId: string, payload: UpdateBookDto, file ?: Express.Multer.File) {
    try {
      const verifyBook = await this.bookModel.findById(bookId);
      if(!verifyBook) throw new ConflictException('Book not found');
      const updateObj = {...payload}
      if(file){
        const cloudinaryUpload = await this.cloudinaryService.uploadImage(file.path);
        updateObj['pdf'] = {
          url : cloudinaryUpload.secure_url,
          publicId : cloudinaryUpload.public_id
        }
      }
      const updatedBook = await this.bookModel.findByIdAndUpdate(bookId, {$set : updateObj}, {new : true});
      return new ResponseBody(200, 'Book updated successfully', updatedBook, true);
    } catch (error) {
      throw error
    }
  }

  async deleteBook(bookId: string) {
    try {
      const deleteBook = await this.bookModel.findByIdAndUpdate(bookId, {$set : {isDeleted : true}}, {new : true});
      if(!deleteBook) throw new ConflictException('Book not found');
      return new ResponseBody(200, 'Book deleted successfully', deleteBook, true);
    } catch (error) {
      throw error
    }
  }
}


