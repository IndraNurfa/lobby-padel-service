import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

interface ApiErrorOptions {
  status: HttpStatus;
  message: string;
  description?: string;
}

/**
 * Swagger decorator that documents an error response with the standard
 * envelope shape:
 *   { "code": <status>, "message": "<message>", "data": null }
 */
export function ApiErrorResponse(options: ApiErrorOptions) {
  const { status, message, description = 'Error' } = options;

  return applyDecorators(
    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          code: { type: 'number', example: status },
          message: { type: 'string', example: message },
          data: { nullable: true, type: 'object', example: null },
        },
      },
    }),
  );
}
