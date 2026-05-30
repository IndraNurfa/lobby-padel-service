import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repositories';
import { UserModel } from './entities/users.entities';
import { RegisterDto } from 'src/auth/dto/req-auth.dto';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(data: RegisterDto): Promise<UserModel> {
    return await this.usersRepository.createUser(data as UserModel);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.usersRepository.findByEmail(email);
  }
}
