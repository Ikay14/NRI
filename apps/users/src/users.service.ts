import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserProfile } from './schema/user.schema';
import { CreateProfileDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt'
import { UserProfileEntity } from './interface/user-profile.interface';
import { PublicUserEntity } from './interface/user-public.interface';


@Injectable()
export class UsersService {
  constructor (
    private readonly userRepository: UserRepository
  ){}
  getHello(): string {
    return 'Hello World!';
  }

  async createUserProfile(dto: CreateProfileDto):Promise<UserProfileEntity>{
      return await this.userRepository.create(dto)
   
  }

  async getProfile(userId: string):Promise<UserProfile | null>{
    return await this.userRepository.findByUserId(userId)
  }

  async getPublicProfile(userId: string):Promise<UserProfileEntity>{
    return await this.getPublicProfile(userId)
  }

  async searchUsers(searchTerm: string): Promise<PublicUserEntity[]> {
    return this.userRepository.searchProfiles(searchTerm);
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
}
}
