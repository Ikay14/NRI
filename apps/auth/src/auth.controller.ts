import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('register')
  async registerUser(
    @Body() register: CreateUserDto 
  ){
    return await this.authService.createUser(register)
  }

  @Post('login')
  async login(
        @Body() login: LoginDto
  ){
    return await this.authService.login(login)
  }

  @Post('refresh')
  async validateToken(
    @Body('token') token: string
  ){
    return await this.authService.validateUser(token)
  }
}
