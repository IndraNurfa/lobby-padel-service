import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  constructor() {}

  use(req: Request, res: Response, next: NextFunction): void {
    const requestTimestamp = new Date().toISOString();
    const startTime = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const latencyMs = parseFloat(
        (seconds * 1000 + nanoseconds / 1_000_000).toFixed(3),
      );

      const statusCode = res.statusCode;
      const logEntry = {
        timestamp: requestTimestamp,
        level:
          statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
        correlationId: req.headers['x-correlation-id'] ?? null,
        ip: req.ip || req.socket?.remoteAddress || '-',
        method: req.method,
        path: req.originalUrl,
        statusCode,
        latencyMs,
        contentLength: Number(res.getHeader('content-length') ?? 0),
        userAgent: req.headers['user-agent'] ?? '',
        referer: req.headers['referer'] ?? '',
      };

      if (statusCode >= 500) {
        this.logger.error(JSON.stringify(logEntry));
      } else if (statusCode >= 400) {
        this.logger.warn(JSON.stringify(logEntry));
      } else {
        this.logger.log(JSON.stringify(logEntry));
      }
    });

    next();
  }
}
