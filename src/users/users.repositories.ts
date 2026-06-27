import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserModel } from './entities/users.entities';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);
  constructor(
    @InjectRepository(UserModel) private readonly repo: Repository<UserModel>,
  ) {}

  async createUser(data: UserModel): Promise<UserModel> {
    return await this.repo.save(data);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    return await this.repo.findOne({
      where: { email },
    });
  }
}
