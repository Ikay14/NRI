import { Controller, Get } from '@nestjs/common';
import { NriService } from './nri.service';

@Controller()
export class NriController {
  constructor(private readonly nriService: NriService) {}

  @Get()
  getHello(): string {
    return this.nriService.getHello();
  }
}
