import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const startTime = Date.now();

    // Log inicial da requisição
    this.logger.debug(`[${method}] ${originalUrl} iniciada - IP: ${ip}`);

    // Interceptar o final da resposta
    const originalSend = res.send;
    res.send = function (body) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const { statusCode } = res;

      // Log final da requisição
      const logger = new Logger(LoggerMiddleware.name);
      logger.debug(
        `[${method}] ${originalUrl} finalizada - ${statusCode} - ${duration}ms`
      );

      return originalSend.call(this, body);
    };

    next();
  }
}
