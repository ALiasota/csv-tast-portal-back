import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Public } from './auth/public.declaration';

@Controller()
export class AppController {
  constructor() {}

  @ApiOperation({ summary: 'Check alive' })
  @Public()
  @Get()
  getHello(): string {
    return 'Ok';
  }
}
