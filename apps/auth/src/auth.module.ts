import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthUser } from './schema/auth.schema';
import { PostgresDatabaseModule } from '@app/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import Joi from 'joi';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_URI: Joi.string().required(),
      }),
      envFilePath: './apps/auth/.env',
    }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([AuthUser])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
