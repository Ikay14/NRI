import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUser } from './schema/auth.schema';
import { PostgresDatabaseModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import  * as Joi from 'joi';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
        INTERNAL_SERVICE_TOKEN: Joi.string().required(),
        USER_SERVICE_URL: Joi.string().uri().required(),
        COOKIE_SECRET: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([AuthUser]),
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, JwtService],
})
export class AuthModule {}
