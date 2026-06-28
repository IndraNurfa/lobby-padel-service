import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorDto {
  @ApiProperty({
    example: 401,
  })
  code!: number;

  @ApiProperty({
    example: 'Unauthorized',
  })
  message!: string;

  @ApiProperty({
    nullable: true,
    example: null,
  })
  data!: null;
}
