import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../database/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class RefreshTokenService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  async generateRefreshToken(
    userId: string,
    deviceId?: string,
    deviceInfo?: any,
  ): Promise<string> {
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
        parseInt(this.configService.get('JWT_REFRESH_EXPIRES_DAYS', '30')),
    );

    await this.prismaService.refreshToken.create({
      data: {
        token,
        userId,
        deviceId,
        deviceInfo,
        expiresAt,
      },
    });

    return token;
  }

  async validateRefreshToken(token: string): Promise<any> {
    const refreshToken = await this.prismaService.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      throw new Error('Token inválido');
    }

    if (refreshToken.isRevoked) {
      throw new Error('Token revogado');
    }

    if (refreshToken.expiresAt < new Date()) {
      await this.revokeRefreshToken(token);
      throw new Error('Token expirado');
    }

    if (!refreshToken.user.isActive) {
      throw new Error('Usuário inativo');
    }

    return refreshToken;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prismaService.refreshToken.update({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(
    userId: string,
    exceptToken?: string,
  ): Promise<void> {
    const whereCondition: any = { userId, isRevoked: false };

    if (exceptToken) {
      whereCondition.token = { not: exceptToken };
    }

    await this.prismaService.refreshToken.updateMany({
      where: whereCondition,
      data: { isRevoked: true },
    });
  }

  async revokeDeviceTokens(userId: string, deviceId: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: {
        userId,
        deviceId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  }

  async cleanExpiredTokens(): Promise<void> {
    await this.prismaService.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });
  }
}
