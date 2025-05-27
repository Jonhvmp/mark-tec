import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export { CreateUserDto as RegisterDto } from '../../users/dto/create-user.dto';
