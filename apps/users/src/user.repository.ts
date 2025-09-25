import { AbstractMongoRepository } from "@app/common";
import { Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserProfileEntity } from "./interface/user-profile.interface";
import { UserProfile } from "./schema/user.schema";
import { PublicUserEntity } from "./interface/user-public.interface";


export class UserRepository extends AbstractMongoRepository<UserProfileEntity> {
    protected readonly logger = new Logger(UserRepository.name)
    
    constructor (
        @InjectModel(UserProfile.name) private readonly userModel: Model<UserProfile>
    ){
        super(userModel)
    }

    
  async findByUserId(userId: string): Promise<UserProfileEntity | null> {
    const profile = await this.userModel.findOne({ where: { userId } })
    return profile ? this.mapEntityToInterface(profile) : null
  }

  async findPublicProfile(userId: string): Promise<PublicUserEntity | null> {
    const profile = await this.userModel.findOne({ where: { userId } })
    return profile ? this.mapToPublicInterface(profile) : null
  }

  async searchProfiles(searchTerm: string): Promise<PublicUserEntity[]> {
    const regex = new RegExp(searchTerm, 'i')
    const profiles = await this.userModel.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { location: regex }
      ]
    }).limit(20)

    return profiles.map(profile => this.mapToPublicInterface(profile))
  }



   private mapEntityToInterface(entity: UserProfile): UserProfileEntity {
    return {
      userId: entity.userId,
      email: entity.email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phoneNumber: entity.phoneNumber,
      avatar: entity.avatar,
      dateOfBirth: entity.dateOfBirth,
      bio: entity.bio,
      location: entity.location,
      preferences: entity.preferences,
      socialMedia: entity.socialMedia,
      fullName: entity.fullName,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private mapToPublicInterface(entity: UserProfile): PublicUserEntity {
    return {
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      fullName: entity.fullName,
      avatar: entity.avatar,
      bio: entity.bio,
      location: entity.location,
    };
  }

} 