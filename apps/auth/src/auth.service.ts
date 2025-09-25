import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from 'https-service'
import { AuthEntity } from './interface/auth-entity.interface';
import { jwtPayload } from './interface/jwtPayload.interface';
import { LoginDto } from './dto/login-dto';


@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name)
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly httpService: HttpService
  ) {
  }

  getHello(): string {
    return 'Hello World!';
  }

 async createUser(registerDto: CreateUserDto): Promise<{ 
      user: AuthEntity; msg: string,  accessToken: string; refreshToken: string 
}>{

  const { email, password, firstName, lastName } = registerDto;

  const existingUser = await this.authRepository.findByEmail(email)
  if (existingUser) throw new ConflictException('User already exists');

  const hashPassword = await this.authRepository.hashPassword(password)

  const authData = {
        email: email,
        password: hashPassword,
        firstName: firstName,
        lastName: lastName
  }

  const user = await this.authRepository.create(authData)

  const token = await this.generateTokens({
    sub: user.id,
    email: user.id,
    role: user.role
  })

  await this.authRepository.setRefreshToken(user.id, token.refreshToken)

  await this.createUserProfile({
      userId: user.id,
      email: user.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });


  return {
    msg: 'user registered successfully', 
    user,
    accessToken: token.accessToken,
    refreshToken: token.refreshToken 
  }
 }

 async login(
  login: LoginDto
): Promise<{ user: AuthEntity; accessToken: string; refreshToken: string }> {
  const { email, password } = login

  const existingUser = await this.authRepository.validatePassword(email, password);
  if (!existingUser) {
    throw new UnauthorizedException('Invalid credentials')
  }

  const user = await this.authRepository.findByEmail(email)
  if (!user) {
    throw new UnauthorizedException('User not found')
  }

  if (!user.id) {
    throw new InternalServerErrorException('User ID is missing');
  }
  const tokens = await this.generateTokens({
    sub: user.id,
    email: user.email,
    role: user.role ?? '', 

  })

  await this.authRepository.setRefreshToken(user.id, tokens.refreshToken)

  return {
    user: user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}


async refreshToken(id: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {

    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    })

    const user = await this.authRepository.validateRefreshToken(id, refreshToken)
    if (!user) {
      throw new UnauthorizedException('Refresh token not valid')
    }


    const tokens = await this.generateTokens({
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    })

    return tokens
}


async validateUser(token: string): Promise<AuthEntity | null> {
    try {
      const payload = this.jwtService.verify(token);
      return await this.authRepository.findByEmail(payload.email);
    } catch {
      return null
    }
  }



  private async createUserProfile(profileData: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<void> {
    try {
      await this.httpService.post(
        `${process.env.USER_SERVICE_URL}/api/users/profiles`,
        profileData,
        {
          headers: {
            'X-Service-Token': process.env.INTERNAL_SERVICE_TOKEN
          }
        }
      ).toPromise();
    } catch (error) {
      this.logger.error('Failed to create user profile', error);
      throw new InternalServerErrorException('Failed to create user profile');
    }
  }

    private async generateTokens(payload:jwtPayload) {
  
      const accessToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      const refreshToken = this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
      })

      return { accessToken, refreshToken }
    }
}

