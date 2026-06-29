/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import { UserModel } from './entities/users.entities';
import { UsersRepository } from './users.repositories';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(data: any): Promise<UserModel> {
    return await this.usersRepository.createUser(data);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserModel | null> {
    return await this.usersRepository.findById(id);
  }
}
