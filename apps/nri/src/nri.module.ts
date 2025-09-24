import { Module } from '@nestjs/common';
import { NriController } from './nri.controller';
import { NriService } from './nri.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi'
import { PostgresDatabaseModule } from '@app/common';
import { Nri } from './schema/nri.schema';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      validationSchema: Joi.object({
        // to validate every env field to start the server 
        POSTGRES_URI: Joi.string().required(),
      }),
      envFilePath: './apps/nri/.env',
    }),
    PostgresDatabaseModule,
    TypeOrmModule.forFeature([Nri])
  ],
  controllers: [NriController],
  providers: [NriService],
})
export class NriModule {} 
