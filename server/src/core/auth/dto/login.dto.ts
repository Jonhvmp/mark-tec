import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsEnum,
  Matches,
  IsPhoneNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserType } from '@prisma/client';

export class LoginDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;

  @IsString({ message: 'Senha deve ser uma string' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(1, { message: 'Senha não pode estar vazia' })
  @MaxLength(50, { message: 'Senha muito longa' })
  password: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  deviceInfo?: any;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class RegisterDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(100, { message: 'Email deve ter no máximo 100 caracteres' })
  email: string;
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(50, { message: 'Senha deve ter no máximo 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message:
      'Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número',
  })
  password: string;

  @IsEnum(UserType, { message: 'Tipo de usuário inválido' })
  userType: UserType;

  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Nome deve conter apenas letras e espaços',
  })
  name: string;

  @IsPhoneNumber('BR', {
    message: 'Telefone deve ser um número brasileiro válido',
  })
  @Transform(({ value }) => value?.replace(/\D/g, ''))
  phone: string;

  @IsString({ message: 'Endereço deve ser uma string' })
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @MinLength(5, { message: 'Endereço deve ter no mínimo 5 caracteres' })
  @MaxLength(200, { message: 'Endereço deve ter no máximo 200 caracteres' })
  @Transform(({ value }) => value?.trim())
  address: string;

  @IsString({ message: 'Cidade deve ser uma string' })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @MinLength(2, { message: 'Cidade deve ter no mínimo 2 caracteres' })
  @MaxLength(100, { message: 'Cidade deve ter no máximo 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
    message: 'Cidade deve conter apenas letras e espaços',
  })
  city: string;

  @IsString({ message: 'Estado deve ser uma string' })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @MinLength(2, { message: 'Estado deve ter no mínimo 2 caracteres' })
  @MaxLength(2, { message: 'Estado deve ter exatamente 2 caracteres' })
  @Transform(({ value }) => value?.toUpperCase().trim())
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve ser uma sigla válida (ex: SP, RJ)',
  })
  state: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  deviceInfo?: any;
}

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token deve ser uma string' })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  refreshToken: string;

  @IsOptional()
  @IsString()
  deviceId?: string;
}

export class LogoutDto {
  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  logoutAllDevices?: boolean;
}

export class ChangePasswordDto {
  @IsString({ message: 'Senha atual deve ser uma string' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @MaxLength(50, { message: 'Nova senha deve ter no máximo 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message:
      'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número',
  })
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token é obrigatório' })
  @IsNotEmpty({ message: 'Token não pode estar vazio' })
  token: string;

  @IsString({ message: 'Nova senha deve ser uma string' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @MaxLength(50, { message: 'Nova senha deve ter no máximo 50 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]/, {
    message:
      'Nova senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número',
  })
  newPassword: string;
}
