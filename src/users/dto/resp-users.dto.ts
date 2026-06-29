import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class ResponseUserDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id!: number;

  @ApiProperty({ example: 'johndoe@example.com' })
  @Expose()
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  @Expose()
  full_name!: string;

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
