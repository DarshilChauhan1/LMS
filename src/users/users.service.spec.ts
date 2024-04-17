import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseBody } from '../helpers/helper'
import { ConfigService } from '@nestjs/config';
import { PlatformEnum } from './enum/platform.enum';
import { CustomError } from '../helpers/Error/customError';
import { BadRequestException } from '@nestjs/common';
import exp from 'constants';
describe('UsersService', () => {
  let userService: UsersService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findById: jest.fn()

  }



  const mockRoleRepository = {
    findOne: jest.fn().mockImplementation(() => ({
      select: jest.fn()
    })),
  }

  const mockConfigService = {
    get: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn(),
    verifyAsync: jest.fn(),
  }

  const hashspy = jest.spyOn(bcrypt, 'hash')
  const compareSpy = jest.spyOn(bcrypt, 'compare')

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getModelToken('Role'), useValue: mockRoleRepository }
      ],
    }).compile();

    userService = module.get<UsersService>(UsersService);
    hashspy.mockClear()
  });

  afterEach(() => {
    jest.clearAllMocks()
  })



  it('it should create a new user with hashed password', async () => {

    mockUserRepository.findOne.mockResolvedValue(null)
    mockRoleRepository.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ _id: '1234' })
    }))

    const signupDto = {
      username: "test",
      email: 'test@gmail.com',
      password: 'password'
    }
    const response = await userService.singup(signupDto)
    console.log(hashspy.mock.calls);

    expect(response).toEqual(new ResponseBody(201, 'User Created Successfully', undefined, true))
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1)
    expect(mockRoleRepository.findOne).toHaveBeenCalledTimes(1)

  })

  it('it should return error if user already exists', async () => {
    mockUserRepository.findOne.mockResolvedValue({})

    const signupDto = {
      username: "test",
      email: 'email@email.com',
      password: 'password'
    }
    try {
      await userService.singup(signupDto)
    } catch (error) {
      expect(error.message).toEqual('User Already Exists')
    }
  })

  it('hash function should be called once', async () => {
    mockUserRepository.findOne.mockResolvedValue(null)
    const signupDto = {
      username: "test",
      email: 'test@gmail.com',
      password: 'password'
    }
    const response = await userService.singup(signupDto)

    expect(hashspy).toHaveBeenCalledTimes(1);
    expect(hashspy).toHaveBeenCalledWith('password', 10);
  })

  it('it should logout user and give me response of logout user sucessfully', async () => {
    const payload = {
      userId: "1234"
    }

    const mockGetUserById = {
      username: "test",
      email: "test@email.com",
      platform: PlatformEnum.APPLICATION,
      refreshToken: "random",
      assignements: [],
      books: [],
      isDelete: false,
      isActive: true,
      save: jest.fn()
    }

    mockUserRepository.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockGetUserById)
    }))
    const response = await userService.logout(payload.userId)
    expect(response).toEqual(new ResponseBody(200, 'Logout Successfully', undefined, true))
    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1)
    expect(mockGetUserById.refreshToken).toEqual('')
    expect(mockGetUserById.save).toHaveBeenCalledTimes(1)
  })

  it('it should throw error if user not found in the logout', async () => {
    const payload = {
      userId: "1234",
      save: jest.fn()
    }
    mockUserRepository.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null)
    }))
    try {
      await userService.logout(payload.userId)
    } catch (error) {
      expect(error.message).toEqual('User not found')
    }
    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1)
    expect(payload.save).not.toHaveBeenCalled()
  })

  it('it should get me refresh token', async () => {
    const payload = {
      userId: "1234",
      refreshToken: "random"
    }

    mockUserRepository.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ refreshToken: "random" })
    }))

    mockJwtService.verifyAsync.mockResolvedValue(true)
    mockJwtService.sign.mockReturnValue("randomString")

    const response = await userService.getRefreshToken(payload)

    expect(response).toEqual(new ResponseBody(200, 'Token Refreshed Successfully', { accessToken: "randomString", refreshToken: "random" }, true))
    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1)
    expect(mockJwtService.verifyAsync).toHaveBeenCalledTimes(1)
  })

  it('it should throw custom error if the refresh token is expiered', async () => {
    const payload = {
      userId: "1234",
      refreshToken: "refreshToken"
    }
    mockUserRepository.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({ refreshToken: "refreshToken" })
    }))

    mockJwtService.verifyAsync.mockResolvedValue(false)
    try {
      await userService.getRefreshToken(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(CustomError)
      expect(error.message).toEqual('Token Expired')
    }

  })

  it('it should throw error if refresh token is invalid', async () => {
    const payload = {
      userId: "1234",
      refreshToken: "random"
    }

    const mockUser = {
      refreshToken : "different"
    }
   mockUserRepository.findById.mockImplementation(() => ({
      select : jest.fn().mockResolvedValue(mockUser)
    }))

    try {
      await userService.getRefreshToken(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toEqual('Invalid Refresh Token')
    }

    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1)
  })

  it('should throw error if refresh token is not provided', async () => {
    const payload = {
      userId: "1234",
      refreshToken: ""
    }

    try {
      await userService.getRefreshToken(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toEqual('Refresh Token is required')
    }
  })

  it('it should throw error if user not found', async () => {
    const payload = {
      userId: "1234",
      refreshToken: "random"
    }
    mockUserRepository.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null)
    }))
    try {
      await userService.getRefreshToken(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toEqual('User not found')
    }

    expect(mockUserRepository.findById).toHaveBeenCalledTimes(1)
  })

})
