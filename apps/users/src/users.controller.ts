import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-user.dto';
import { InternalServiceGuard } from './guards/internal-service.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHello(): string {
    return this.usersService.getHello();
  }

  @UseGuards(InternalServiceGuard)
  @Post('create-profile')
  async createUserProfile(
    @Body() dto: CreateProfileDto){
    return await this.usersService.createUserProfile(dto)
  }

  @Get('get-user/:userId')
  async getUserProfile(@Param('userId') userId: string){
    return this.usersService.getProfile(userId)
  }

  @Get('get-profile/:userId')
  async getPublicProfile(@Param('userId') userId: string){
    return this.usersService.getPublicProfile(userId)
  }

  @Get('search')
  async searchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query('page') page = 1
  ){
    return this.usersService.searchUsers(searchTerm, Number(page) || 1)
  }

  @UseGuards(InternalServiceGuard)
  @Delete('delete-user/:userId')
  async deleteProfile(@Param('userId') userId: string ){
    return this.usersService.deleteProfile(userId)
  }
}
