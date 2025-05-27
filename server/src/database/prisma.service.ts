import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database conectado');
    } catch (error) {
      this.logger.error('Falha ao conectar ao database:', error.message);
      this.logger.warn(
        'Certifique-se de que o banco de dados está em execução e as credenciais estão corretas.',
      );
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Database desconectado');
    } catch (error) {
      this.logger.error('Erro ao desconectar do database:', error.message);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
