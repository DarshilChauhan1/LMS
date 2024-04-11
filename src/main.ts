import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './common/config/swagger.config';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  //app.useGlobalPipes(new ValidationPipe({disableErrorMessages : true}));
  await app.listen(3000);
}

bootstrap()