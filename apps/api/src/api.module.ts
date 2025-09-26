import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
      envFilePath: './apps/api/.env',
      }),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {} 
