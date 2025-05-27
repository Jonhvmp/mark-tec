import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    private prismaService: PrismaService,
  ) {}

  @Get()
  getHello(): object {
    return {
      message: 'Technical Services Platform API',
      status: 'running',
      version: '1.0.0',
      environment: this.configService.get<string>('app.environment'),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  async getHealth(): Promise<object> {
    const dbHealthy = await this.prismaService.healthCheck();

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('app.environment'),
      port: this.configService.get<number>('app.port'),
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        healthy: dbHealthy,
      },
    };
  }
}
