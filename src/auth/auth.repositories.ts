import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { SessionModel } from './entities/session.entities';

@Injectable()
export class AuthRepository {
  private readonly logger = new Logger(AuthRepository.name);
  constructor(
    @InjectRepository(SessionModel)
    private readonly repo: Repository<SessionModel>,
  ) {}

  async saveSession(data) {
    await this.repo.save(data);
  }

  async findOne(jti: string): Promise<SessionModel | null> {
    return await this.repo.findOne({ where: { jti, revokedAt: IsNull() } });
  }

  async updateAccessToken(jti: string, token: string) {
    return await this.repo.update(
      { jti },
      {
        token,
        tokenExpired: new Date(Date.now() + 15 * 60 * 1000),
      },
    );
  }

  revokeToken(jti: string) {
    return this.repo.update(
      { jti },
      {
        revokedAt: new Date(),
      },
    );
  }
}
