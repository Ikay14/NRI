import { NestFactory } from '@nestjs/core';
import { CourierModule } from './courier.module';

async function bootstrap() {
  const app = await NestFactory.create(CourierModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
