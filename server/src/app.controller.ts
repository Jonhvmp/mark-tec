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
      environment: this.configService.get<string>('NODE_ENV'),
      timestamp: new Date().toISOString(),
      prefix: this.configService.get<string>('API_PREFIX'),
      endpoints: {
        health: '/health',
        api: `/${this.configService.get<string>('API_PREFIX') || 'api/v1'}`,
        auth: `/${this.configService.get<string>('API_PREFIX') || 'api/v1'}/auth`,
        users: `/${this.configService.get<string>('API_PREFIX') || 'api/v1'}/users`,
      },
    };
  }

  @Get('health')
  async getHealth(): Promise<object> {
    const dbHealthy = await this.prismaService.healthCheck();

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: this.configService.get<string>('NODE_ENV'),
      port: this.configService.get<number>('PORT'),
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
        healthy: dbHealthy,
      },
    };
  }
}
