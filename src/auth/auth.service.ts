/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Cache } from 'cache-manager';
import { customAlphabet } from 'nanoid';
import { UsersService } from '../users/users.service';
import {
  LoginByPassDto,
  LoginDto,
  RegisterDto,
  VerifyOtpDto,
} from './dto/req-auth.dto';
import { randomUUID } from 'node:crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret: string;
  private readonly access_token_expires: string;
  private readonly refresh_token_expires: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.jwtSecret =
      this.configService.get<string>('JWT_SECRET') || 'JWT_SECRET';
    this.access_token_expires =
      this.configService.get<string>('ACCESS_TOKEN_EXP') || '1H';
    this.refresh_token_expires =
      this.configService.get<string>('REFRESH_TOKEN_EXP') || '7D';
  }

  async register(dto: RegisterDto) {
    const exist = await this.usersService.findByEmail(dto.email);
    if (exist) {
      throw new ConflictException('User with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, 12);

    dto.password = hashed;

    return await this.usersService.createUser(dto);
  }

  async loginByEmailPassword(dto: LoginByPassDto) {
    const exist = await this.usersService.findByEmail(dto.email);
    if (!exist) {
      throw new UnauthorizedException('Wrong Email or Password!');
    }

    const isPasswordMatching = await bcrypt.compare(
      dto.password,
      exist.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Wrong Email or Password!');
    }

    const jti = randomUUID();

    const jwtData = { jti, sub: exist.id, role: exist.role };

    const [access_token, refresh_token] = await Promise.all([
      this.generateJwt({
        ...jwtData,
        token_type: 'access_token',
      }),
      this.generateJwt({
        ...jwtData,
        token_type: 'refresh_token',
      }),
    ]);

    return { ...exist, access_token, refresh_token };
  }

  async loginByOtp(dto: LoginDto): Promise<string> {
    const exist = await this.usersService.findByEmail(dto.email);
    if (!exist) {
      throw new BadRequestException('Wrong Email or Password!');
    }

    const nanoid = customAlphabet('1234567890');
    const otp = nanoid(6);

    await Promise.all([
      this.cacheManager.set<string>(
        `auth:otp:${dto.email}`,
        otp,
        5 * 60 * 1000,
      ),
      this.cacheManager.set<number>(
        `auth:otp:${dto.email}:attempts`,
        0,
        5 * 60 * 1000,
      ),
    ]);
    this.logger.log(`OTP ${dto.email}:: ${otp}`);
    return 'OK!';
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<string> {
    const [otp, attemps] = await Promise.all([
      this.cacheManager.get<string>(`auth:otp:${dto.email}`),
      this.cacheManager.get<number>(`auth:otp:${dto.email}:attempts`),
    ]);

    if (!otp) throw new UnauthorizedException('Invalid or expired OTP');

    if ((attemps ?? 0) >= 5) {
      throw new HttpException(
        'Too many attempts',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set<number>(
      `auth:otp:${dto.email}:attempts`,
      (attemps ?? 0) + 1,
      5 * 60 * 1000,
    );

    if (otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    return 'OK!';
  }

  async generateJwt(data: any): Promise<string> {
    const expire =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      data.token_type === 'access_token'
        ? this.access_token_expires
        : this.refresh_token_expires;
    return this.jwtService.signAsync(data, {
      secret: this.jwtSecret,
      expiresIn: expire,
    });
  }
}
