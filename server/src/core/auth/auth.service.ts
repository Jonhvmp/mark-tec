import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RegisterDto } from "./dto/login.dto";
import * as bcrypt from "bcryptjs";


@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuário inativo');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      userType: user.userType,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
      },
    };
  }
}
