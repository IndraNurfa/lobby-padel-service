import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repositories';
import { UserModel } from './entities/users.entities';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(data: any) {
    return await this.usersRepository.createUser(data);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.usersRepository.findByEmail(email);
  }
}
