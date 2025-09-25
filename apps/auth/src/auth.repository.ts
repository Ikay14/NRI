import { AbstractPostgresRepository } from "@app/common";
import { AuthEntity } from "./interface/auth-entity.interface";
import { Logger } from "@nestjs/common";
import { AuthUser } from "./schema/auth.schema";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

export class AuthRepository extends AbstractPostgresRepository<AuthUser>{
    protected readonly logger = new Logger(AuthRepository.name)

    constructor( @InjectRepository(AuthUser) authuserRepository: Repository<AuthUser>){
        super(authuserRepository)
    }

  // Authentication-specific methods
    async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

    async findByEmail(email: string): Promise<AuthEntity | null> {
    const user = await this.repository.findOne({ where: { email } });
    return user ? this.mapAuthEntityToInterface(user) : null;
  }

    async validatePassword(email: string, password: string): Promise<boolean> {
    const user = await this.repository.findOne({ 
      where: { email },
      select: ['id', 'password', 'isActive']
    });

    if (!user || !user.isActive || user.isLocked) {
      return false;
    }

    return await bcrypt.compare(password, user.password);
  }

  async setRefreshToken(id: string, refreshToken: string): Promise<void> {
    const hashedToken = refreshToken ? await bcrypt.hash(refreshToken, 12) : null;
    await this.repository.update(id, { refreshToken: hashedToken });
  }

  async validateRefreshToken(id: string, refreshToken: string): Promise<boolean> {
    const user = await this.repository.findOne({
      where: { id },
      select: ['id', 'refreshToken']
    });

    if (!user?.refreshToken) return false;
    return await bcrypt.compare(refreshToken, user.refreshToken);
  }

    protected mapAuthEntityToInterface(entity: AuthUser): AuthEntity {  
    return {
      email: entity.email,
      role: entity.role,
      isActive: entity.isActive,
      isEmailVerified: entity.isEmailVerified,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
    }
}    