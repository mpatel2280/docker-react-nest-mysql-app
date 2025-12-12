import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserActivityService } from './user-activity.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userActivityService: UserActivityService,
  ) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    // Log activity
    await this.userActivityService.logUserCreated(
      user.id,
      user.email,
      user.name ?? undefined,
      { email: user.email, name: user.name ?? undefined },
    );

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
  ) {
    const pageNum = page ? Number.parseInt(page, 10) : 1;
    const limitNum = limit ? Number.parseInt(limit, 10) : 10;
    const cursorNum = cursor ? Number.parseInt(cursor, 10) : undefined;

    return this.userService.findAll(pageNum, limitNum, cursorNum);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    // Get old data before update
    const oldUser = await this.userService.findOne(id);
    if (!oldUser) {
      throw new Error('User not found');
    }

    // Update user
    const updatedUser = await this.userService.update(id, updateUserDto);

    // Log activity
    await this.userActivityService.logUserUpdated(
      updatedUser.id,
      updatedUser.email,
      updatedUser.name ?? undefined,
      { email: oldUser.email, name: oldUser.name ?? undefined },
      { email: updatedUser.email, name: updatedUser.name ?? undefined },
    );

    return updatedUser;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // Get user data before deletion
    const user = await this.userService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete user
    await this.userService.remove(id);

    // Log activity
    await this.userActivityService.logUserDeleted(
      user.id,
      user.email,
      user.name ?? undefined,
      { email: user.email, name: user.name ?? undefined },
    );

    return { message: 'User deleted successfully' };
  }
}

