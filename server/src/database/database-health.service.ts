import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);

  constructor(private configService: ConfigService) {}

  async checkDatabaseConnection(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    message: string;
    details?: any;
  }> {
    try {
      const databaseUrl = this.configService.get<string>('DATABASE_URL');

      if (!databaseUrl) {
        return {
          status: 'error',
          message: 'DATABASE_URL não configurado',
        };
      }

      return {
        status: 'disconnected',
        message:
          'Conexão com o banco de dados não estabelecida',
        details: {
          url: databaseUrl ? 'configured' : 'missing',
          environment: this.configService.get<string>('NODE_ENV'),
        },
      };
    } catch (error) {
      this.logger.error('Erro ao verificar conexão com o database:', error);
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
