import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: 200 })
  code!: number;

  @ApiProperty({ example: 'success' })
  message!: string;

  @ApiProperty({ type: Object, nullable: true })
  data!: T;
}
