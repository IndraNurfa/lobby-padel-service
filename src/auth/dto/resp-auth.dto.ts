import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ResponseRegisterDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName!: string;

  @Exclude()
  password!: string;

  @ApiProperty({ example: 'user' })
  @Expose()
  role!: string;

  @Exclude()
  createdAt!: string;

  @Exclude()
  updatedAt!: string;
}

export class ResponseLoginDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  fullName!: string;

  @Exclude()
  password!: string;

  @ApiProperty({ example: 'user' })
  @Expose()
  role!: string;

  @Exclude()
  createdAt!: string;

  @Exclude()
  updatedAt!: string;

  @ApiProperty({
    example: 'example_access_token',
  })
  @Expose()
  access_token!: string;

  @ApiProperty({
    example: 'example_refresh_token',
  })
  @Expose()
  refresh_token!: string;
}
