import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionModel } from './entities/session.entities';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(
    @InjectRepository(SessionModel)
    private readonly repo: Repository<SessionModel>,
  ) {}

  async saveSession(data: SessionModel): Promise<SessionModel> {
    return await this.repo.save(data);
  }
}
