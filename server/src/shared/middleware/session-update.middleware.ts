import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SessionService } from '../../core/auth/services/session.service';

@Injectable()
export class SessionUpdateMiddleware implements NestMiddleware {
  constructor(private sessionService: SessionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Se há um usuário autenticado e deviceId
    if (req.user && req.headers['x-device-id']) {
      const userId = (req.user as any).id;
      const deviceId = req.headers['x-device-id'] as string;

      try {
        await this.sessionService.updateSessionActivity(userId, deviceId);
      } catch (error) {
        // Fail silently
      }
    }

    next();
  }
}
