import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let userService: UserService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    const hashedPassword = '$2b$10$hashedpassword';
    const mockCreatedUser = {
      id: 1,
      email: createUserDto.email,
      name: createUserDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await userService.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockCreatedUser);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return paginated users without passwords', async () => {
      const mockUsers = [
        {
          id: 1,
          email: 'user1@example.com',
          name: 'User 1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          email: 'user2@example.com',
          name: 'User 2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(20);

      const result = await userService.findAll(1, 10);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(mockPrismaService.user.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: mockUsers,
        meta: {
          total: 20,
          page: 1,
          limit: 10,
          hasMore: true,
          nextCursor: 2,
        },
      });
    });

    it('should return paginated users with cursor', async () => {
      const mockUsers = [
        {
          id: 3,
          email: 'user3@example.com',
          name: 'User 3',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(20);

      const result = await userService.findAll(2, 10, 2);

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        cursor: { id: 2 },
        skip: 1,
        take: 10,
        orderBy: {
          id: 'asc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result.data).toEqual(mockUsers);
      expect(result.meta.nextCursor).toBe(3);
    });
  });

  describe('findOne', () => {
    it('should return a user by id without password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findOne(1);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      password: 'newpassword123',
    };

    const hashedPassword = '$2b$10$newhashedpassword';
    const mockUpdatedUser = {
      id: 1,
      email: 'test@example.com',
      name: updateUserDto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.update(1, updateUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          ...updateUserDto,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUpdatedUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should update user without password if not provided', async () => {
      const updateWithoutPassword: UpdateUserDto = {
        name: 'Updated Name',
      };

      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await userService.update(1, updateWithoutPassword);

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateWithoutPassword,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      const mockDeletedUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.delete.mockResolvedValue(mockDeletedUser);

      const result = await userService.remove(1);

      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockDeletedUser);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email with password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
      expect(result).toHaveProperty('password');
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.validatePassword(
        'password123',
        '$2b$10$hashedpassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        '$2b$10$hashedpassword',
      );
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await userService.validatePassword(
        'wrongpassword',
        '$2b$10$hashedpassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        '$2b$10$hashedpassword',
      );
      expect(result).toBe(false);
    });
  });
});

