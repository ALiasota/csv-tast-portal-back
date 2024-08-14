import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

async function bootstrap() {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task Portal')
    .setDescription('Documentation for tasks enpoints')
    .setVersion('1.0')
    .addTag('task')
    .addBearerAuth(
      {
        type: 'http',
        name: 'JWT',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ? process.env.PORT : 3000);
}
bootstrap();
