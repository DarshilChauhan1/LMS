import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './entities/book.entity';
import {CloudinaryService} from '../cloudinary/cloudinary.service'
import { Profile } from '../profiles/entities/profile.entity';
import * as helper from '../helpers/helper';

describe('BooksService',  () => {
  let bookService: BooksService;

  const mockPipelinePagination = jest.spyOn(helper, 'PipelinePagination')

  const mockCloudinaryService = {
    uploadImage: jest.fn()
  }

  const mockProfileRepository = {
    findOne: jest.fn(),
    update: jest.fn()
  }

  const mockBooksRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    aggregate: jest.fn()
  }


  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: mockBooksRepository },
        { provide: getModelToken('User'), useValue: mockUserRepository },
        {provide : CloudinaryService, useValue: mockCloudinaryService},
        {provide : getModelToken(Profile.name), useValue: mockProfileRepository}
      ],
    }).compile();

    bookService = module.get<BooksService>(BooksService);
  });
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('it should return all the books for the admin only search query', async() => {
    const payload = {
      search: 'search',
    }

    let skipPages = (payload['page'] ? (parseInt(payload['page']) - 1) : 0) * (parseInt(payload['limit']) ? parseInt(payload['limit']) : 10)

    const pipelinePaginationPayload = {
      skipPages : skipPages,
      limit : '10',
      order_by : 'order_by'
    }

    const mockBooks = [
      { title: 'title', author: 'author', standard: 'standard', description: 'description', pdf: { url: 'url', publicId: 'publicId' } },
      { title: 'title2', author: 'author2', standard: 'standard2', description: 'description2', pdf: { url: 'url2', publicId: 'publicId2' } }
    ]

    const searchPipeline = [
      {
        $match : {
          isDeleted : false
        }
      },
      {
        $match : {
          $or : [
            { title : { $regex : 'search', $options : 'i' } },
            { author : { $regex : 'search', $options : 'i' } }
          ]
        }
      }
    ]

    const pipelinePagination = [
      {
        $skip: 0
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]

    const mockCount = [{ total : mockBooks.length}]
    const pagination = helper.PipelinePagination(pipelinePaginationPayload.skipPages, pipelinePaginationPayload.limit, pipelinePaginationPayload.order_by)

    expect(pagination).toEqual(pipelinePagination)

    expect(mockPipelinePagination).toHaveBeenCalledTimes(1);

    mockBooksRepository.aggregate
    .mockReturnValueOnce(mockCount)
    .mockReturnValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments : mockBooks.length,
      data : mockBooks
    }, true))

    

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count : 'total' }]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith(
      [
       ...searchPipeline,
       ...pipelinePagination
      ]
    )
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  });
});
