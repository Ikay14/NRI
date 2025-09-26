import { Controller, Get, Body, Post, Param, Query, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateProfileDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getHello(): string {
    return this.usersService.getHello();
  }

  @Post('create-profile')
  async createUserProfile(
    @Body() dto: CreateProfileDto){
    return await this.usersService.createUserProfile(dto)
  }

  @Get('get-user')
  async getUserProfile(@Param('userId') userId: string){
    return this.usersService.getProfile(userId)
  }

  @Get('get-profile')
  async getPublicProfile(@Param('userId') userId: string){
    return this.usersService.getPublicProfile(userId)
  }

  @Get('user/:searchTerm')
  async searchTerm(
    @Query('searchTerm') searchTerm: string,
    @Query('page') page: number
  ){
    return this.usersService.searchUsers(searchTerm, page)
  }

  @Delete('delete-user')
  async deleteProfile(@Param('userId') userId: string ){
    return this.usersService.deleteProfile(userId)
  }
}
