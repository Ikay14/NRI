import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { MongoDatabaseModule } from '@app/common';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required() 
      }),
      envFilePath: 'apps/users/.env'
    }),
    MongooseModule.forFeature([
      {name: User.name, schema: UserSchema }
    ]),
    MongoDatabaseModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})

export class UsersModule {}
