import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Get,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { AdminAuthGuard } from 'src/auth/admin-auth.guard';

@UseGuards(FirebaseAuthGuard)
@UseGuards(AdminAuthGuard)
@Controller('/api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Post('create')
  async createUser(
    @Body()
    body: {
      email: string;
      password: string;
      displayName: string;
      serverData: any;
      isAdmin: boolean;
    },
  ) {
    return this.userService.createUser(
      body.email,
      body.password,
      body.displayName,
      body.serverData,
      body.isAdmin,
    );
  }

  @Put('update/:uid')
  async updateUser(
    @Param('uid') uid: string,
    @Body()
    body: {
      email?: string;
      password?: string;
      displayName?: string;
      serverData?: any;
      isAdmin: boolean;
    },
  ) {
    return this.userService.updateUser(uid, body);
  }

  @Delete('delete/:uid')
  async deleteUser(@Param('uid') uid: string) {
    return this.userService.deleteUser(uid);
  }

  @Get(':uid')
  async findUser(@Param('uid') uid: string) {
    return this.userService.findUserByUid(uid);
  }
}
