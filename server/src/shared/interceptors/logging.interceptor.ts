import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const contentType = headers['content-type'] || '';

    const startTime = Date.now();

    // Log da requisição
    this.logger.log(
      `${method} ${url} - IP: ${ip} - User-Agent: ${userAgent.substring(0, 50)}${userAgent.length > 50 ? '...' : ''}`,
    );

    // Se há body na requisição, log do tipo de conteúdo
    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.debug(`Request Body Type: ${contentType}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const { statusCode } = response;

          // Emoji baseado no status code
          let statusEmoji = '✅';
          if (statusCode >= 400 && statusCode < 500) {
            statusEmoji = '⚠️';
          } else if (statusCode >= 500) {
            statusEmoji = '❌';
          }

          this.logger.log(
            `${statusEmoji} ${method} ${url} - ${statusCode} - ${duration}ms`,
          );

          // Log detalhado para desenvolvimento
          if (process.env.NODE_ENV === 'development' && duration > 1000) {
            this.logger.warn(`Requisição lenta detectada: ${duration}ms`);
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.error(
            `${method} ${url} - ERRO - ${duration}ms`,
            error.message,
          );
        },
      }),
    );
  }
}
