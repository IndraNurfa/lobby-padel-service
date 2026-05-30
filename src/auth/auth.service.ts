import { ConflictException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/req-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private usersService: UsersService) {}

  async register(dto: RegisterDto) {
    const exist = await this.usersService.findByEmail(dto.email);
    if (exist) {
      throw new ConflictException('User with this email already exists');
    }
    const hashed = await bcrypt.hash(dto.password, 12);

    dto.password = hashed;

    return await this.usersService.createUser(dto);
  }
}
