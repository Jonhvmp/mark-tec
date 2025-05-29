import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prismaService: PrismaService) {}

  async logAction(
    action: string,
    entity: string,
    entityId?: string,
    userId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    await this.prismaService.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      },
    });
  }

  async getAuditLogs(
    userId?: string,
    entity?: string,
    limit: number = 100,
  ): Promise<any[]> {
    const whereCondition: any = {};

    if (userId) whereCondition.userId = userId;
    if (entity) whereCondition.entity = entity;

    return this.prismaService.auditLog.findMany({
      where: whereCondition,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
