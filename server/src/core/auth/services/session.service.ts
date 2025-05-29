import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SessionService {
  constructor(private prismaService: PrismaService) {}

  async createSession(
    userId: string,
    deviceId: string,
    deviceInfo: any,
    ipAddress: string,
    userAgent: string,
  ): Promise<void> {
    // Desativar sessões anteriores do mesmo dispositivo
    await this.prismaService.userSession.updateMany({
      where: { userId, deviceId },
      data: { isActive: false },
    });

    // Criar nova sessão
    await this.prismaService.userSession.create({
      data: {
        userId,
        deviceId,
        deviceInfo,
        ipAddress,
        userAgent,
        isActive: true,
      },
    });
  }

  async updateSessionActivity(userId: string, deviceId: string): Promise<void> {
    await this.prismaService.userSession.updateMany({
      where: { userId, deviceId, isActive: true },
      data: { lastActivity: new Date() },
    });
  }

  async deactivateSession(userId: string, deviceId?: string): Promise<void> {
    const whereCondition: any = { userId, isActive: true };

    if (deviceId) {
      whereCondition.deviceId = deviceId;
    }

    await this.prismaService.userSession.updateMany({
      where: whereCondition,
      data: { isActive: false },
    });
  }

  async getUserSessions(userId: string): Promise<any[]> {
    return this.prismaService.userSession.findMany({
      where: { userId, isActive: true },
      select: {
        id: true,
        deviceId: true,
        deviceInfo: true,
        ipAddress: true,
        lastActivity: true,
        createdAt: true,
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async cleanInactiveSessions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prismaService.userSession.deleteMany({
      where: {
        OR: [{ isActive: false }, { lastActivity: { lt: thirtyDaysAgo } }],
      },
    });
  }
}
