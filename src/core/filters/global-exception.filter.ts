/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface ErrorResponse {
  code: number;
  message: string;
  data: null;
  meta: {
    timestamp: string;
    path: string;
    correlationId?: string;
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const correlationId = request.headers['x-correlation-id'] as
      | string
      | undefined;

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle HttpException
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, any>).message ||
            'Unknown error';
    }
    // Handle ValidationError from class-validator
    else if (
      Array.isArray(exception) &&
      exception[0]?.constraints !== undefined
    ) {
      statusCode = 422;
      const constraints = exception
        .flatMap((error: any) => Object.values(error.constraints || {}))
        .join(', ');
      message = constraints || 'Validation failed';
    }
    // Handle TypeORM QueryFailedError
    else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database operation failed';
    }
    // Handle TypeORM EntityNotFoundError
    else if (exception instanceof EntityNotFoundError) {
      statusCode = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
    }
    // Handle generic Error
    else if (exception instanceof Error) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      // Log full stack trace for 5xx errors
      this.logger.error(
        `[${correlationId || 'no-correlation-id'}] ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      // Log only method + url + status for 4xx errors
      this.logger.warn(
        `[${correlationId || 'no-correlation-id'}] ${request.method} ${request.url} - ${statusCode}`,
      );
    }

    const errorResponse: ErrorResponse = {
      code: statusCode,
      message,
      data: null,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
        ...(correlationId && { correlationId }),
      },
    };

    httpAdapter.reply(response, errorResponse, statusCode);
  }
}
