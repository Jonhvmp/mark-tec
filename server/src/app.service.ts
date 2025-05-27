import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Plataforma de Serviços Técnicos | Backend!';
  }
}
