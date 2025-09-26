import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login-dto';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @Post('register')
  async registerUser(
    @Body() register: CreateUserDto,
    @Res({ passthrough: true }) res: Response
  ){
    const user = await this.authService.createUser(register)

    res.cookie('access_token', user.accessToken,{
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      signed: true,
      path: '/'
    })

    res.cookie('refresh_token', user.refreshToken,{
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      signed: true,
      path: '/'
    })

    return { user }
  }

  @Post('login')
  async login(
    @Body() login: LoginDto,
    @Res({ passthrough: true }) res: Response
  ){
    const { user, accessToken, refreshToken } = await this.authService.login(login)

    res.cookie('access_token', accessToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
      signed: true,
      path: '/'
    })

    res.cookie('refresh_token', refreshToken, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      signed: true,
      path: '/'
    })

    return { user, accessToken, refreshToken }
  }

  @Post('verify')
  async validateToken(
    @Body('token') token: string
  ){
    return await this.authService.validateUser(token)
  }

  @Post('verify-otp')
  async validateOtp(
    @Body('email') email: string, 
    @Body('otp') otp: string
  ){
    return this.authService.validateOtp(email, otp)
  }
  
  @Post('refresh')
  async refreshToken(
    @Body()  userId: string, refreshToken: string 
  ){
    return this.authService.refreshToken(userId, refreshToken)
  }
}
