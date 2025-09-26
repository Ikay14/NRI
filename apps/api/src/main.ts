import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { Logger, ConsoleLogger, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'
import { TransformInterceptor } from 'libs/interceptors/global-interceptor';



async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    bufferLogs: true,
    logger: new ConsoleLogger({
    prefix: 'Nri_Microservice_App',
    logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
  }),
  
  });


  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.useGlobalPipes(new ValidationPipe({transform: true}))

  app.enableCors('trust proxy');

  app.setGlobalPrefix('api/v1', { exclude : ['api', 'api/v1', 'api/docs'] });

  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.port ?? 3000);
}
bootstrap();
