import { applyDecorators, HttpStatus, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiSuccessOptions {
  status?: HttpStatus;
  description?: string;
  isArray?: boolean;
}

/**
 * Swagger decorator that documents a success response with the standard
 * envelope shape:
 *   { "code": 200, "message": "success", "data": <model | model[]> }
 *
 * Usage:
 *   @ApiSuccessResponse(ResponseLoginDto)
 *   @ApiSuccessResponse(ResponseLoginDto, { isArray: true, status: HttpStatus.OK })
 */
export function ApiSuccessResponse<TModel extends Type<any>>(
  model: TModel,
  options: ApiSuccessOptions = {},
) {
  const {
    status = HttpStatus.OK,
    description = 'Success',
    isArray = false,
  } = options;

  return applyDecorators(
    // Register only the model itself — avoids the circular-dependency
    // that occurs when registering the generic ApiResponseDto<T>.
    ApiExtraModels(model),

    ApiResponse({
      status,
      description,
      schema: {
        type: 'object',
        properties: {
          code: {
            type: 'number',
            example: status,
          },
          message: {
            type: 'string',
            example: 'success',
          },
          data: isArray
            ? {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              }
            : { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}
