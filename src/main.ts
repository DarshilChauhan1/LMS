import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSwagger } from './common/config/swagger.config';

let swaggerDocument: any;

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const document = setupSwagger(app);
  await app.listen(3000);
  return document;
}

bootstrap().then((document) => {
  swaggerDocument = document;
});

export { swaggerDocument };
