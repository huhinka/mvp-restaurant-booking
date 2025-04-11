import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppExceptionFilter } from './app-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const validationPipe = new ValidationPipe({
    transform: true,
    // 保证异常过滤器可以拿到校验字段名称
    exceptionFactory: (errors) => new BadRequestException(errors),
  });

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(validationPipe);
  app.useGlobalFilters(new AppExceptionFilter());

  await app.listen(process.env.PORT || 3030);
}

bootstrap();
