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
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
  })
  @Expose()
  access_token!: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
  })
  @Expose()
  refresh_token!: string;
}
