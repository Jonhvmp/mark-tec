import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object') {
        message = (errorResponse as any).message || exception.message;
        details = errorResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = {
        name: exception.name,
        stack: process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    // Log do erro
    const { method, url, ip } = request;
    this.logger.error(
      `🚨 [${method}] ${url} - ${status} - IP: ${ip}`,
      `Erro: ${message}`,
      exception instanceof Error && process.env.NODE_ENV === 'development' 
        ? exception.stack
        : undefined
    );

    // Resposta padronizada de erro
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(details && process.env.NODE_ENV === 'development' && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
