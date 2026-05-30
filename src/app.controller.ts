import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Idempotent } from './core/decorators/idempotent.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('test')
  testRandomError(): any {
    return this.appService.testRandomError();
  }

  @Post('test-idempotency')
  @Idempotent()
  testIdempotency(): any {
    return this.appService.testIdempotency();
  }
}
