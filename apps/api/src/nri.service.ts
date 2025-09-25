import { Injectable } from '@nestjs/common';

@Injectable()
export class NriService {
  getHello(): string {
    return 'Hello World!';
  }
}
