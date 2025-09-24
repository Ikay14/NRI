import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'


@Injectable()
export class UsersService {
  constructor (
    private readonly userRepository: UserRepository
  ){}
  getHello(): string {
    return 'Hello World!';
  }

  async createUser(dto: CreateUserDto):Promise<User>{
    const { password } = dto

    const hashPassword = await bcrypt.hash(password, 10)

    return this.userRepository.create({
      ...dto,
      password: hashPassword
    })
  }
}
