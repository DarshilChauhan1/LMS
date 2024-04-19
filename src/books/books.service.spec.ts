import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { getModelToken } from '@nestjs/mongoose';
import { Book } from './entities/book.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service'
import { Profile } from '../profiles/entities/profile.entity';
import * as helper from '../helpers/helper';
import e from 'express';
import { title } from 'process';

describe('BooksService', () => {
  let bookService: BooksService;

  const mockPipelinePagination = jest.fn()

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
    mockBooksRepository.aggregate.mockClear()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: getModelToken(Book.name), useValue: mockBooksRepository },
        { provide: getModelToken('User'), useValue: mockUserRepository },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
        { provide: getModelToken(Profile.name), useValue: mockProfileRepository },
        { provide: helper.PipelinePagination, useValue: mockPipelinePagination }
      ],
    }).compile();

    bookService = module.get<BooksService>(BooksService);
  });
  afterEach(() => {
    jest.clearAllMocks()
  })

  const mockBooks = [
    { title: 'title', author: 'author', standard: 'standard', description: 'description', pdf: { url: 'url', publicId: 'publicId' } },
    { title: 'title2', author: 'author2', standard: 'standard2', description: 'description2', pdf: { url: 'url2', publicId: 'publicId2' } },
    { title: 'title3', author: 'author3', standard: 'standard3', description: 'description3', pdf: { url: 'url3', publicId: 'publicId3' } }
  ]

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

    expect`mockBooksRepository.aggregate`.toHaveBeenCalledWith([{ $count: 'total' }])

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
            {title : { $regex: 'filter', $options: 'i' } },
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


})
