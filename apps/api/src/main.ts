import { NestFactory } from '@nestjs/core';
import { NriModule } from './nri.module';

async function bootstrap() {
  const app = await NestFactory.create(NriModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
