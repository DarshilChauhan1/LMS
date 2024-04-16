import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResponseBody } from '../helpers/helper'


describe('AuthService', () => {
  let authService: AuthService;
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn()
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService }
      ],
    }).compile();
    authService = module.get<AuthService>(AuthService);
  });

  it('should response with success true and response data with tokens when login', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    const mockUser = {
      username: 'Crawford_Ondricka',
      email: 'Junior.Stiedemann76@yahoo.com',
      password: hashedPassword,
      role_id: '661392a72451301eded2184e',
      isActive: true,
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2MTY2MTJjOThlM2I4Njc0OTA2NWM0MyIsImlhdCI6MTcxMjkwMTM5NywiZXhwIjoxNzEyOTg3Nzk3fQ.ALbpqzbAH--nkP4cErQ6pN0aN6QUYJTj2kf_F7550QE',
      platform_field: 'APPLICATION'
    }

    mockUserRepository.findOne.mockResolvedValue(mockUser);
    mockJwtService.sign.mockReturnValue('token');

    const loginDto = {
      username: 'Crawford_Ondricka',
      password: '12345'
    }

    const response = await authService.login(loginDto);

    expect(response).toEqual(new ResponseBody(200, 'Login successfully', {
      message: "Login successfully",
      statusCode: 200,
      success: true,
      data: {
        access_token: 'token',
        refresh_token: 'token',
        user: {
          _id: '661392a72451301eded2184e',
          username: 'Crawford_Ondricka',
          email: 'Junior.Stiedemann76@yahoo.com'
        }
      }
    }, true ))
    expect(mockUserRepository.findOne).toHaveBeenCalledWith({ username: 'Crawford_Ondricka' })
  });
});
