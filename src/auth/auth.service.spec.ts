import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseBody } from '../helpers/helper';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PlatformEnum } from '../users/enum/platform.enum';
import { after } from 'node:test';



describe('AuthService', () => {
  let authService: AuthService;
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn()
  }

  const mockConfigService = {
    get: jest.fn()
  }

  const mockBcryptCampare = jest.spyOn(bcrypt, 'compare');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService }
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('it should give access and refresh token if the user is successfully logged in', async () => {
    const payload = {
      username: 'test',
      password: 'test'
    }

    const mockUser = {
      _id: 'testId',
      username: 'testUsername',
      email: 'testEmail',
      password: 'testPassword',
      refreshToken: "testRefreshToken",
      isActive: true,
      save: jest.fn()
    }
    mockUserRepository.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser)
    }))

    mockBcryptCampare.mockResolvedValue(true)

    let callCount = 0;
    mockJwtService.signAsync.mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve('accessToken')
      }
      return Promise.resolve('refreshToken')
    }
    )
    const response = await authService.login(payload)
    expect(response).toEqual(new ResponseBody(200, 'Login successfully', { access_token: 'accessToken', refresh_token: 'refreshToken', user: { _id: "testId", username: "testUsername", email: "testEmail" } }, true))
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: payload.username })
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
    expect(mockUser.save).toHaveBeenCalled()
    expect(mockBcryptCampare).toHaveBeenCalled()

  })

  it('it should throw an error if the user is not found', async () => {
    const payload = {
      username: 'test',
      password: 'test'
    }

    mockUserRepository.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(null)
    }))

    try {
      await authService.login(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException)
      expect(error.message).toEqual('User not found')
    }
  })

  it('it should throw an error if the password is incorrect', async () => {
    const payload = {
      username: 'test',
      password: 'test'
    }

    const mockUser = {
      _id: 'testId',
      username: 'testUsername',
      email: 'testEmail',
      password: 'testPassword',
      refreshToken: "testRefreshToken",
      isActive: true,
      save: jest.fn()
    }
    mockBcryptCampare.mockResolvedValue(false)
    mockUserRepository.findOne.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockUser)
    }))

    try {
      await authService.login(payload)
      expect(mockBcryptCampare).toHaveBeenCalled()
      mockBcryptCampare.mockResolvedValue(false)
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedException)
      expect(error.message).toEqual('Password is incorrect')
    }
  })

  it('it should throw an error if the username and password is not provided', async () => {
    const payload = {
      username: '',
      password: ''
    }

    try {
      await authService.login(payload)
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException)
      expect(error.message).toEqual('All fields are required')
    }
  })

  it('it should allow me to use google login', async () => {
    const payload = {
      username: 'test',
      email: 'test@gmail.com'
    }

    mockUserRepository.findOne.mockResolvedValue(null)
    mockUserRepository.create.mockImplementation(() => ({ _id: 'id', ...payload, platform_field: PlatformEnum.GOOGLE, isActive: true }))
    let count = 0;
    mockJwtService.signAsync.mockImplementation(async () => {
      count++;
      if (count === 1) {
        return Promise.resolve('access_token')
      }
      return Promise.resolve('refresh_token')
    })

    const response = await authService.googleLogin(payload)
    expect(response).toEqual(new ResponseBody(201, 'User created successfully and logged in successfully', {
      user: { _id : "id", username: 'test', email: 'test@gmail.com', platform_field: 'google', isActive: true }, access_token : 'access_token', refresh_token: 'refresh_token', message: 'User created successfully and logged in successfully'}, true))
    expect(mockUserRepository.findOne).toHaveBeenCalled()
    expect(mockUserRepository.create).toHaveBeenCalled()
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
  })

  it('it should only generate access and refreshToken of google Auth if user already exists', async () => {
    const payload = {
      username: 'test',
      email: 'test@gmail.com'
    }
    mockUserRepository.findOne.mockResolvedValue({ _id: 'id', ...payload, platform_field: PlatformEnum.GOOGLE, isActive: true })
    mockJwtService.signAsync
    .mockImplementationOnce(()=> Promise.resolve('access_token'))
    .mockImplementationOnce(()=> Promise.resolve('refresh_token'))

    const response = await authService.googleLogin(payload)
    expect(response).toEqual(new ResponseBody(201, 'User logged in successfully', { user : { _id : "id", username: 'test', email: 'test@gmail.com', platform_field: 'google', isActive: true }, access_token : 'access_token', refresh_token: 'refresh_token', message: 'User logged in successfully'}, true))
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ $or: [{email : payload.email}, {username : payload.username}], platform_field: PlatformEnum.GOOGLE })
    expect(mockUserRepository.findOne).toHaveBeenCalledTimes(1)
  })
})

