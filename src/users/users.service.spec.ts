import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { platform } from 'os';

describe('UsersService', () => {
  let userService: UsersService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {provide : getModelToken(User.name), useValue : mockUserRepository},
        {provide : JwtService, useValue : mockJwtService}
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
  });

  afterEach(()=>{
    jest.clearAllMocks()
  })

  it('should return a success status code and reponse data with token when successfull', async() => {
    const hashedPassword = await bcrypt.hash('password', 10);
    const mockUser = {
      username : 'test',
      email : 'test@gmail.com',
      password : hashedPassword,
      role_id : '1234',
      isActive : true,
      refreshToken : '',
      platform_field : 'APPLICATION'
    }

    mockUserRepository.findOne.mockResolvedValue(mockUser)
    mockJwtService.sign.mockReturnValue('token')

    const loginDto = {
      email : 'test@gmail.com',
      password : 'password'
    }


  });
});
