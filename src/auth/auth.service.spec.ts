import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let authService: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: '$2b$10$hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return user with access token on successful login', async () => {
      const mockAccessToken = 'mock.jwt.token';
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(mockAccessToken);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        accessToken: mockAccessToken,
      });
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('accessToken');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUserService.validatePassword).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.validatePassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockUserService.validatePassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });
  });
});

