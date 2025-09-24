import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({ 
    imports: [ 
TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('POSTGRES_URI'),
    autoLoadEntities: true,
    synchronize: true, // Set to false in production
      ssl: {
        rejectUnauthorized: false,
      }
   }),
    inject: [ConfigService],
   }),
]
})

export class PostgresDatabaseModule {}