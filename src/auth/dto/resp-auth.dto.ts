import { Exclude, Expose } from 'class-transformer';

export class ResponseRegisterDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  fullName!: string;

  @Exclude()
  password!: string;

  @Expose()
  role!: string;

  @Exclude()
  createdAt!: string;
  @Exclude()
  updatedAt!: string;
}

export class ResponseLoginDto {
  @Expose()
  id!: number;

  @Expose()
  email!: string;

  @Expose()
  fullName!: string;

  @Exclude()
  password!: string;

  @Expose()
  role!: string;

  @Exclude()
  createdAt!: string;

  @Exclude()
  updatedAt!: string;

  @Expose()
  access_token!: string;

  @Expose()
  refresh_token!: string;
}
