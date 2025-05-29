import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from './services/refresh-token.service';
import { SessionService } from './services/session.service';
import { AuditService } from './services/audit.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCK_TIME = 30 * 60 * 1000; // 30 minutos

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private refreshTokenService: RefreshTokenService,
    private sessionService: SessionService,
    private auditService: AuditService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    try {
      // Verificar se email já existe
      const existingUser = await this.usersService.findByEmail(
        registerDto.email,
      );
      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      // Verificar se telefone já existe
      const existingPhone = await this.usersService.findByPhone(
        registerDto.phone,
      );
      if (existingPhone) {
        throw new ConflictException('Telefone já está em uso');
      }

      // Criar usuário
      const user = await this.usersService.create(registerDto);

      // Log da ação
      await this.auditService.logAction(
        'USER_REGISTER',
        'User',
        user.id,
        user.id,
        null,
        { email: user.email, userType: user.userType },
        ipAddress,
        userAgent,
      );

      // Gerar tokens
      const tokens = await this.generateTokens(
        user,
        registerDto.deviceId,
        registerDto.deviceInfo,
        ipAddress,
        userAgent,
      );

      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
        message: 'Usuário registrado com sucesso',
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Erro ao registrar usuário');
    }
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      if (!user) {
        await this.auditService.logAction(
          'LOGIN_FAILED',
          'User',
          undefined,
          undefined,
          null,
          { email: loginDto.email, reason: 'User not found' },
          ipAddress,
          userAgent,
        );
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Verificar se conta está bloqueada
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        const remainingTime = Math.ceil(
          (user.lockedUntil.getTime() - Date.now()) / 60000,
        );
        throw new ForbiddenException(
          `Conta bloqueada. Tente novamente em ${remainingTime} minutos`,
        );
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );

      if (!isPasswordValid) {
        await this.handleFailedLogin(user.id);
        await this.auditService.logAction(
          'LOGIN_FAILED',
          'User',
          user.id,
          user.id,
          null,
          { reason: 'Invalid password' },
          ipAddress,
          userAgent,
        );
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Verificar se usuário está ativo
      if (!user.isActive) {
        throw new ForbiddenException('Conta desativada');
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(user.id);

      // Gerar tokens
      const tokens = await this.generateTokens(
        user,
        loginDto.deviceId,
        loginDto.deviceInfo,
        ipAddress,
        userAgent,
      );

      // Atualizar último login
      await this.usersService.updateLastLogin(user.id);

      // Log da ação
      await this.auditService.logAction(
        'USER_LOGIN',
        'User',
        user.id,
        user.id,
        null,
        { deviceId: loginDto.deviceId },
        ipAddress,
        userAgent,
      );

      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        ...tokens,
        message: 'Login realizado com sucesso',
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao fazer login');
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<any> {
    try {
      const refreshTokenData =
        await this.refreshTokenService.validateRefreshToken(
          refreshTokenDto.refreshToken,
        );

      const user = refreshTokenData.user;

      // Revogar token atual
      await this.refreshTokenService.revokeRefreshToken(
        refreshTokenDto.refreshToken,
      );

      // Gerar novos tokens
      const tokens = await this.generateTokens(
        user,
        refreshTokenDto.deviceId,
        refreshTokenData.deviceInfo,
      );

      return {
        ...tokens,
        message: 'Tokens renovados com sucesso',
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async logout(
    userId: string,
    logoutDto: LogoutDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    try {
      if (logoutDto.logoutAllDevices) {
        // Logout de todos os dispositivos
        await this.refreshTokenService.revokeAllUserTokens(userId);
        await this.sessionService.deactivateSession(userId);
      } else {
        // Logout apenas do dispositivo atual
        if (logoutDto.deviceId) {
          await this.refreshTokenService.revokeDeviceTokens(
            userId,
            logoutDto.deviceId,
          );
          await this.sessionService.deactivateSession(
            userId,
            logoutDto.deviceId,
          );
        }
      }

      // Log da ação
      await this.auditService.logAction(
        'USER_LOGOUT',
        'User',
        userId,
        userId,
        null,
        {
          deviceId: logoutDto.deviceId,
          allDevices: logoutDto.logoutAllDevices,
        },
        ipAddress,
        userAgent,
      );

      return {
        message: logoutDto.logoutAllDevices
          ? 'Logout realizado em todos os dispositivos'
          : 'Logout realizado com sucesso',
      };
    } catch (error) {
      throw new BadRequestException('Erro ao fazer logout');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    try {
      const user = await this.usersService.findById(userId);

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(
        changePasswordDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Senha atual incorreta');
      }

      // Atualizar senha
      await this.usersService.updatePassword(
        userId,
        changePasswordDto.newPassword,
      );

      // Revogar todos os tokens (forçar novo login)
      await this.refreshTokenService.revokeAllUserTokens(userId);

      // Log da ação
      await this.auditService.logAction(
        'PASSWORD_CHANGED',
        'User',
        userId,
        userId,
        null,
        null,
        ipAddress,
        userAgent,
      );

      return {
        message: 'Senha alterada com sucesso. Faça login novamente',
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Erro ao alterar senha');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(forgotPasswordDto.email);

      if (!user) {
        // Não informar se email existe por segurança
        return {
          message: 'Se o email existir, um link de recuperação será enviado',
        };
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // 1 hora

      await this.usersService.setPasswordResetToken(
        user.id,
        resetToken,
        resetExpires,
      );

      // Aqui você enviaria o email com o token
      // await this.emailService.sendPasswordReset(user.email, resetToken);

      return {
        message: 'Se o email existir, um link de recuperação será enviado',
      };
    } catch (error) {
      throw new BadRequestException('Erro ao solicitar recuperação de senha');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<any> {
    try {
      const user = await this.usersService.findByPasswordResetToken(
        resetPasswordDto.token,
      );

      if (
        !user ||
        !user.passwordResetExpires ||
        user.passwordResetExpires < new Date()
      ) {
        throw new BadRequestException('Token inválido ou expirado');
      }

      // Atualizar senha
      await this.usersService.updatePassword(
        user.id,
        resetPasswordDto.newPassword,
      );

      // Limpar token de reset
      await this.usersService.clearPasswordResetToken(user.id);

      // Revogar todos os tokens
      await this.refreshTokenService.revokeAllUserTokens(user.id);

      return {
        message: 'Senha redefinida com sucesso. Faça login com a nova senha',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Erro ao redefinir senha');
    }
  }

  async getUserSessions(userId: string): Promise<any> {
    return this.sessionService.getUserSessions(userId);
  }

  private async generateTokens(
    user: any,
    deviceId?: string,
    deviceInfo?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.refreshTokenService.generateRefreshToken(
      user.id,
      deviceId,
      deviceInfo,
    );

    // Criar sessão se deviceId fornecido
    if (deviceId && ipAddress && userAgent) {
      await this.sessionService.createSession(
        user.id,
        deviceId,
        deviceInfo,
        ipAddress,
        userAgent,
      );
    }

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    };
  }
  private async handleFailedLogin(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      return;
    }

    const attempts = user.loginAttempts + 1;

    if (attempts >= this.MAX_LOGIN_ATTEMPTS) {
      const lockUntil = new Date(Date.now() + this.LOCK_TIME);
      await this.usersService.lockUser(userId, lockUntil);
    } else {
      await this.usersService.incrementLoginAttempts(userId);
    }
  }

  private async resetLoginAttempts(userId: string): Promise<void> {
    await this.usersService.resetLoginAttempts(userId);
  }
}
