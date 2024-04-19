import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './entities/book.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import { Profile } from '../profiles/entities/profile.entity';
import * as helper from '../helpers/helper';
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as fs from 'fs'
import { PlatformEnum } from '../users/enum/platform.enum';

describe('BooksService', () => {
  let bookService: BooksService;
  let cloudinaryService: CloudinaryService;

  const mockPipelinePagination = jest.fn()
  let mockfs = jest.fn()

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
    aggregate: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn()
  }


  const mockUserRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
  }

  beforeEach(async () => {
    mockBooksRepository.aggregate.mockClear()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: mockBooksRepository },
        { provide: getModelToken('User'), useValue: mockUserRepository },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: getModelToken(Profile.name), useValue: mockProfileRepository },
        { provide: helper.PipelinePagination, useValue: mockPipelinePagination },
        { provide: fs.unlinkSync, useValue: mockfs }
      ],
    }).compile();

    bookService = module.get<BooksService>(BooksService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });
  afterEach(() => {
    jest.clearAllMocks()
  })

  afterAll(() => {
    mockfs.mockRestore()
  })

  const mockBooks = [
    { title: 'title', author: 'author', standard: 'standard', description: 'description', pdf: { url: 'url', publicId: 'publicId' } },
    { title: 'title2', author: 'author2', standard: 'standard2', description: 'description2', pdf: { url: 'url2', publicId: 'publicId2' } },
    { title: 'title3', author: 'author3', standard: 'standard3', description: 'description3', pdf: { url: 'url3', publicId: 'publicId3' } }
  ]

  const mockUserBooks = [
    { title: 'title1', author: 'author1', standard: '12' },
    { title: 'title2', author: 'author2', standard: '12' },
  ];

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    buffer: Buffer.from('buffer'),
    originalname: 'Banner Report.pdf',
    encoding: 'encoding',
    mimetype: 'mimetype',
    size: 1000,
    destination: 'destination',
    filename: 'filename',
    path: 'temp/abcd.jpg',
    stream: null
  }

  const mockCount = [{ total: mockBooks.length }]

  const searchPipeline = [
    {
      $match: {
        isDeleted: false
      }
    },
    {
      $match: {
        $or: [
          { title: { $regex: '', $options: 'i' } },
          { author: { $regex: '', $options: 'i' } }
        ]
      }
    }
  ]

  const userPipeline = [
    {
      $match: {
        isDeleted: false
      }
    },
    {
      $match: {
        standard: ""
      }
    },
    {
      $match: {
        $or: [
          { title: { $regex: '', $options: 'i' } },
          { author: { $regex: '', $options: 'i' } },
        ]
      }
    },
  ]


  it('should return the correct pagination pipeline', () => {
    const skipPages = 5;
    const limit = '10';
    const order_by = 'asc';

    const result = helper.PipelinePagination(skipPages, limit, order_by);

    expect(result).toEqual([
      {
        $skip: skipPages
      },
      {
        $limit: parseInt(limit)
      },
      {
        $sort: {
          createdAt: order_by === 'asc' ? 1 : -1
        }
      }
    ]);
  })

  it('should return all the books when no query is provided', async () => {
    const mockBooks = [
      { title: 'title1', author: 'author1', standard: 'standard1' },
      { title: 'title2', author: 'author2', standard: 'standard2' },
    ];

    const mockCount = [{ total: mockBooks.length }];

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks);

    const getAllBooks = await bookService.getAllBooks({});

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true));

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2);
  });


  it('it should return all the books for the admin only search query', async () => {
    const payload = {
      search: 'search',
    }

    const mockBooks = [
      { title: 'title', author: 'author', standard: 'standard', description: 'description', pdf: { url: 'url', publicId: 'publicId' } },
      { title: 'title2', author: 'author2', standard: 'standard2', description: 'description2', pdf: { url: 'url2', publicId: 'publicId2' } }
    ]

    const searchPipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: 'search', $options: 'i' } },
            { author: { $regex: 'search', $options: 'i' } }
          ]
        }
      }
    ]

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]


    const mockCount = [{ total: mockBooks.length }]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2);
  });

  it('should return books when filter is provided', async () => {
    const paylaod = {
      filter: 'filter'
    }

    const filterPipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: '', $options: 'i' } },
            { author: { $regex: '', $options: 'i' } }
          ]
        }
      },
      { $match: { $or: [{ author: paylaod.filter }, { title: paylaod.filter }, { standard: paylaod.filter }] } }
    ]

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(paylaod);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...filterPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)

  })

  it('should return books when order_by is provided', async () => {
    const payload = {
      order_by: 'desc'
    }

    const paginationPiple = [
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


    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when page is provided', async () => {
    const payload = {
      page: '2'
    }

    const paginationPiple = [
      {
        $skip: 10
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)

  })

  it('should return books when limit is provided', async () => {
    const paylaod = {
      limit: '20'
    }

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(paylaod);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)

  })

  it('should return books when all query is provided', async () => {
    const payload = {
      search: 'search',
      order_by: 'desc',
      filter: 'filter',
      page: '2',
      limit: '20'
    }

    const allQuery = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: 'search', $options: 'i' } },
            { author: { $regex: 'search', $options: 'i' } }
          ]
        }
      },
      { $match: { $or: [{ author: payload.filter }, { title: payload.filter }, { standard: payload.filter }] } }
    ]

    const paginationPiple = [
      {
        $skip: 20
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...allQuery, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when limit and page is provided', async () => {
    const payload = {
      limit: '20',
      page: '4'
    }

    const paginationPiple = [
      {
        $skip: 60
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)

  })

  it('should return books when limit and order_by is provided', async () => {
    const payload = {
      limit: '20',
      order_by: 'desc'
    }

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when limit and filter is provided', async () => {
    const payload = {
      limit: '20',
      filter: 'filter'
    }

    const filterPipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: '', $options: 'i' } },
            { author: { $regex: '', $options: 'i' } }
          ]
        }
      },
      { $match: { $or: [{ author: payload.filter }, { title: payload.filter }, { standard: payload.filter }] } }
    ]

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...filterPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when page and order_by is provided', async () => {
    const payload = {
      page: '2',
      order_by: 'desc'
    }

    const paginationPiple = [
      {
        $skip: 10
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

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);

    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when page and filter is provided', async () => {
    const payload = {
      page: '2',
      filter: 'filter'
    }

    const filterPipeline = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: '', $options: 'i' } },
            { author: { $regex: '', $options: 'i' } }
          ]
        }
      },
      { $match: { $or: [{ author: payload.filter }, { title: payload.filter }, { standard: payload.filter }] } }
    ]

    const paginationPiple = [
      {
        $skip: 10
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...filterPipeline, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return books when limit and page and order_by is provided', async () => {
    const payload = {
      limit: '20',
      page: '2',
      order_by: 'desc'
    }

    const paginationPiple = [
      {
        $skip: 20
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...searchPipeline, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return book if search and filter and order_by is provided', async () => {
    const payload = {
      search: 'search',
      filter: 'filter',
      order_by: 'desc'
    }

    const allQuery = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: 'search', $options: 'i' } },
            { author: { $regex: 'search', $options: 'i' } },
          ]
        }
      },
      { $match: { $or: [{ author: payload.filter }, { title: payload.filter }, { standard: payload.filter }] } }
    ]

    const paginationPiple = [
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

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockBooks)

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockBooks
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...allQuery, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return empty array if no books are found', async () => {
    const payload = {
      search: 'search',
      filter: 'filter',
      order_by: 'desc',
      page: '2',
      limit: '20'
    }

    const allQuery = [
      {
        $match: {
          isDeleted: false
        }
      },
      {
        $match: {
          $or: [
            { title: { $regex: 'search', $options: 'i' } },
            { author: { $regex: 'search', $options: 'i' } },
          ]
        }
      },
      { $match: { $or: [{ author: payload.filter }, { title: payload.filter }, { standard: payload.filter }] } }
    ]

    const paginationPiple = [
      {
        $skip: 20
      },
      {
        $limit: 20
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ]

    mockBooksRepository.aggregate
      .mockResolvedValueOnce([{ total: 0 }])
      .mockResolvedValueOnce([])

    const getAllBooks = await bookService.getAllBooks(payload);

    expect(getAllBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: 0,
      data: []
    }, true))

    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $count: 'total' }])
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...allQuery, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2)
  })

  it('should return error if the page number is less than zero', async () => {
    const payload = {
      page: '-1'
    }

    try {
      await bookService.getAllBooks(payload);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toEqual('Page number should be greater than 0');
    }

  })

  it('should return user books according to the standard and no query', async () => {
    const userId = {
      student_id: 'student_id'
    }

    const mockProfile = {
      firstname: 'firstname',
      lastname: 'lastname',
      standard: '12',
      student_id: 'student_id'
    }

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    const mockCount = [{ total: mockUserBooks.length }];

    mockProfileRepository.findOne.mockResolvedValue(mockProfile);

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockUserBooks)

    const getUserBooks = await bookService.getUserBooks({}, userId.student_id);

    expect(getUserBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockUserBooks
    }, true))

    userPipeline[1] = { $match: { standard: mockProfile.standard } }
    console.log(userPipeline)

    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ student_id: userId.student_id });
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $match: { standard: mockProfile.standard } }, { $count: 'total' }]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...userPipeline, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2);
  })

  it('should return user books according to the standard and search query', async () => {
    const userId = {
      student_id: 'student_id'
    }

    const mockProfile = {
      firstname: 'firstname',
      lastname: 'lastname',
      standard: '12',
      student_id: 'student_id'
    }

    const payload = {
      search: 'search'
    }

    const paginationPiple = [
      {
        $skip: 0
      },
      {
        $limit: 10
      },
      {
        $sort: {
          createdAt: 1
        }
      }
    ]

    const mockCount = [{ total: mockUserBooks.length }];

    mockProfileRepository.findOne.mockResolvedValue(mockProfile);

    mockBooksRepository.aggregate
      .mockResolvedValueOnce(mockCount)
      .mockResolvedValueOnce(mockUserBooks)

    const getUserBooks = await bookService.getUserBooks(payload, userId.student_id);

    expect(getUserBooks).toEqual(new helper.ResponseBody(200, 'All books received', {
      totalDocuments: mockCount[0].total,
      data: mockUserBooks
    }, true))

    userPipeline[1] = { $match: { standard: mockProfile.standard } }
    userPipeline[2] = { $match: { $or: [{ title: { $regex: payload.search, $options: 'i' } }, { author: { $regex: payload.search, $options: 'i' } }] } }
    console.log(userPipeline)

    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ student_id: userId.student_id });
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([{ $match: { standard: mockProfile.standard } }, { $count: 'total' }]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledWith([...userPipeline, ...paginationPiple]);
    expect(mockBooksRepository.aggregate).toHaveBeenCalledTimes(2);
  })

  it('should throw error if the user has created profile', async () => {
    const payload = {
      student_id: 'student_id'
    }

    mockProfileRepository.findOne.mockResolvedValue(null);
    try {
      await bookService.getUserBooks({}, payload.student_id);
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException);
      expect(error.message).toBe('User not found');
    }
    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ student_id: payload.student_id });
    expect(mockBooksRepository.aggregate).not.toHaveBeenCalled();

  })


  it('should run the cloudinary url and returns object containing url and public_id', async () => {
    const paylaod = {
      path: mockFile.path
    }

    mockCloudinaryService.uploadImage.mockResolvedValue({ url: 'url', public_id: 'public_id' })

    const response = await cloudinaryService.uploadImage(paylaod.path)
    expect(response).toEqual({ url: 'url', public_id: 'public_id' })
    expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(paylaod.path)
    expect(mockCloudinaryService.uploadImage).toHaveBeenCalledTimes(1)

  })


  it('should add the books but only allowed for admin', async () => {
    const paylaod = {
      title: 'title',
      author: 'author',
      standard: 'standard',
      description: 'description',
    }

    mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'url', public_id: 'public_id' })

    const mockBook = {
      title: 'title',
      author: 'author',
      standard: 'standard',
      description: 'description',
      pdf: { url: 'url', publicId: 'public_id' }
    }

    mockBooksRepository.create.mockReturnValue(mockBook)

    const response = await bookService.addBook(paylaod, mockFile);

    expect(response).toEqual(new helper.ResponseBody(201, 'Book added successfully', mockBook, true))
    expect(mockBooksRepository.create).toHaveBeenCalledWith(mockBook)
    expect(mockBooksRepository.create).toHaveBeenCalledTimes(1)
  })

  it('should unlink all the files from the server after cloudinary upload', async () => {
    mockCloudinaryService.uploadImage.mockResolvedValue({ url: 'url', public_id: 'public_id' })
    const unlinkFile = mockfs.mockResolvedValue(undefined)
    unlinkFile(mockFile.path)
    expect(mockfs).toHaveBeenCalledWith(mockFile.path)
    expect(mockfs).toHaveBeenCalledTimes(1)
  })

  it('should throw error if the book already exists', async () => {
    const paylaod = {
      title: 'title',
      author: 'author',
      standard: 'standard',
      description: 'description',
    }
    mockBooksRepository.findOne.mockResolvedValue(mockBooks[0])
    try {
      await mockBooksRepository.findOne({ title: paylaod.title })
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException)
      expect(error.message).toBe('Book already exists')
    }

    expect(mockBooksRepository.findOne).toHaveBeenCalledWith({ title: paylaod.title })
    expect(mockBooksRepository.findOne).toHaveBeenCalledTimes(1)
    expect(mockBooksRepository.create).not.toHaveBeenCalled()
  })

  it('should throw error if the file is not uploaded', async () => {
    mockfs.mockResolvedValue(undefined)
    try {
      await mockfs(mockFile.path)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toBe('Please upload a file')
    }

    expect(mockfs).toHaveBeenCalledWith(mockFile.path)
    expect(mockBooksRepository.create).not.toHaveBeenCalled()
  })

  it('should update the book only the text not the file', async () => {
    const payload = {
      title: 'title2',
      author: 'author2'
    }

    mockBooksRepository.findByIdAndUpdate.mockResolvedValue({ ...mockBooks[0], ...payload })
    const response = await bookService.updateBook('1', payload)
    expect(response).toEqual(new helper.ResponseBody(200, 'Book updated successfully', { ...mockBooks[0], ...payload }, true))
    expect(mockBooksRepository.findByIdAndUpdate).toHaveBeenCalledWith('1', { $set: payload }, { new: true })
    expect(mockBooksRepository.findByIdAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('should update the book with the file', async () => {
    const newFile: Express.Multer.File = {
      fieldname: 'file',
      buffer: Buffer.from('buffer'),
      originalname: 'Banner Report.pdf',
      encoding: 'encoding',
      mimetype: 'mimetype',
      size: 1000,
      destination: 'destination',
      filename: 'filename',
      path: 'temp/abcd.jpg',
      stream: null
    }

    let mockBookToUpdte = {
      _id: 1,
      author: 'author',
      title: 'title',
      standard: 'standard',
      description: 'description',
      pdf: {
        url: 'url',
        publicId: 'publicId'
      }
    }

    const payload = {
      title: 'title2',
      author: 'author2'
    }

    mockBooksRepository.findById.mockResolvedValue(mockBookToUpdte)

    mockCloudinaryService.uploadImage.mockResolvedValue({ secure_url: 'url', public_id: 'public_id' })
    let updatedUser = {
      ...mockBookToUpdte,
      ...payload,
      pdf: { url: 'url', publicId: 'public_id' }
    }

    mockBooksRepository.findByIdAndUpdate.mockResolvedValue(updatedUser)
    const response = await bookService.updateBook('1', payload, newFile)
    expect(response).toEqual(new helper.ResponseBody(200, 'Book updated successfully', updatedUser, true))
    expect(mockBooksRepository.findById).toHaveBeenCalledWith('1')
    expect(mockBooksRepository.findById).toHaveBeenCalledTimes(1)
    expect(mockCloudinaryService.uploadImage).toHaveBeenCalledWith(newFile.path)

  })

  it('should throw error if the book is not found during updating', async () => {
    mockBooksRepository.findById.mockResolvedValueOnce(null)
    try {
      await bookService.updateBook('random', { title: 'title' })
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException)
      expect(error.message).toBe('Book not found')
    }
    expect(mockBooksRepository.findById).toHaveBeenCalledWith('random')
    expect(mockBooksRepository.findById).toHaveBeenCalledTimes(1)
    expect(mockBooksRepository.findByIdAndUpdate).not.toHaveBeenCalled()
  })

  it('should delete the book on the basis of the id', async () => {
    const mockBook = {
      _id: '1',
      title: 'title',
      author: 'author',
      standard: 'standard',
      description: 'description',
      pdf: { url: 'url', publicId: 'publicId' },
      isDeleted: false
    }

    mockBooksRepository.findOne.mockResolvedValueOnce(mockBook)
    let updatedBook = {
      ...mockBook,
      isDeleted: true
    }
    mockBooksRepository.findByIdAndUpdate.mockResolvedValueOnce(updatedBook)
    try {
      const response = await bookService.deleteBook(mockBook._id)
      expect(response).toEqual(new helper.ResponseBody(200, 'Book deleted successfully', updatedBook, true))
      expect(mockBooksRepository.findOne).toHaveBeenCalledWith(mockBook._id)
      expect(mockBooksRepository.findOne).toHaveBeenCalledTimes(1)
      expect(mockBooksRepository.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, { $set: { isDeleted: true } }, { new: true })
    } catch (error) {
      console.log(error)
    }

  })


  it('should throw error if the book is not found during deletion', async () => {
    mockBooksRepository.findOne.mockResolvedValue(null)
    try {
      await bookService.deleteBook('random')
    } catch (error) {
      expect(error).toBeInstanceOf(ConflictException)
      expect(error.message).toBe('Book not found')
 
    expect(mockBooksRepository.findByIdAndUpdate).not.toHaveBeenCalled()
    }
  })


  it('should return all the books selected by the user', async () => {
    const paylaod = {
      books: ['1', '2'],
      student_id: 'id'
    }

    const mockUser = {
      _id: 'random',
      firstname: 'firstname',
      lastname: 'lastname',
      standard: '12',
      student_id: 'id'
    }

    const updatedUser = {
      _id: 'id',
      username: 'username',
      email: 'email',
      role: 'user',
      isDeleted: false,
      books: ['1', '2'],
      platform_field: PlatformEnum.APPLICATION || PlatformEnum.GOOGLE
    }

    mockProfileRepository.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValueOnce(mockUser)
    }))

    mockBooksRepository.find.mockResolvedValueOnce(mockBooks)

    const response = await bookService.selectBook(paylaod.books, paylaod.student_id)

    expect(response).toEqual(new helper.ResponseBody(200, 'Books selected successfully', updatedUser, true))
    expect(mockProfileRepository.findOne).toHaveBeenCalledWith({ student_id: paylaod.student_id })
    expect(mockBooksRepository.find).toHaveBeenCalledWith({ _id: { $in: paylaod.books } })
    expect(mockBooksRepository.find).toHaveBeenCalledTimes(1)

  })


})
