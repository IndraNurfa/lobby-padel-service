import { BadRequestException, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);
  constructor() {}

  testRandomError(): any {
    const randomValue = Math.random();

    if (randomValue < 0.5) {
      throw new BadRequestException(
        'Random error occurred! This is a mock error.',
      );
    }

    return { message: 'Success! Random test passed.', random: randomValue };
  }

  testIdempotency(): { randomNumber: number; timestamp: string } {
    return {
      randomNumber: Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
    };
  }
}
