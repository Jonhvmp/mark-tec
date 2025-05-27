import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule); // Interceptor global de logging
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Filtro global de exceções
    app.useGlobalFilters(new AllExceptionsFilter());

    // config -g de validação
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // CORS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
      ],
      credentials: true,
    });

    // config PORT
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 2004;
    const environment = configService.get<string>('NODE_ENV') || 'development';

    await app.listen(port);

    logger.log(`Aplicação rodando em: http://localhost:${port}`);
    logger.log(`Environment: ${environment}`);
    logger.log(
      `API Prefix: ${configService.get<string>('API_PREFIX') || 'sem prefixo'}`,
    );
    logger.log(`Logs de requisições HTTP habilitados`);
    logger.log(
      `Health check disponível em: http://localhost:${port}/health`,
    );
  } catch (error) {
    logger.error('Erro ao inicializar a aplicação:', error);
    process.exit(1);
  }
}
bootstrap();
