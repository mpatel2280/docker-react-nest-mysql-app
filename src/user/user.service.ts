import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.prisma.user.create({
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
  }

  async findAll(page: number = 1, limit: number = 10, cursor?: number) {
    const skip = cursor ? 1 : (page - 1) * limit;
    const take = limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        ...(cursor && { cursor: { id: cursor } }),
        skip,
        take,
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
      }),
      this.prisma.user.count(),
    ]);

    const hasMore = cursor
      ? users.length === take
      : page * limit < total;

    const nextCursor = users.length > 0 ? users.at(-1)?.id ?? null : null;

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        hasMore,
        nextCursor,
      },
    };
  }

  findOne(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const data: any = { ...updateUserDto };

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.user.delete({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

