import { Exclude, Expose } from 'class-transformer';

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
}
