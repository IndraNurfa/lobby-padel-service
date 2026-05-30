import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserModel } from '../../users/entities/users.entities';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ unique: true })
  jti!: string;

  @Column({ comment: 'sha256 hashed' })
  token!: string;

  @Column({ name: 'refresh_token', comment: 'sha256 hashed' })
  refreshToken!: string;

  @Column({ name: 'token_expired' })
  tokenExpired!: Date;

  @Column({ name: 'refresh_token_expired' })
  refreshTokenExpired!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt?: Date | null;

  @ManyToOne(() => UserModel, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserModel;
}
