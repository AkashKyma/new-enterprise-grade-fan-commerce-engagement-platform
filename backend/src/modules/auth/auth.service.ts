import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../identity/entities';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    private jwt: JwtService,
  ) {}

  async signup(input: { email?: string; phone?: string; password: string; role?: User['role'] }) {
    const hash = await bcrypt.hash(input.password, 10);
    const u = this.users.create({ email: input.email || null, phone: input.phone || null, passwordHash: hash, role: input.role || 'customer' });
    const user = await this.users.save(u);
    const payload = { sub: user.id, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user: { id: user.id, email: user.email, phone: user.phone, role: user.role } };
  }

  async signin(input: { email?: string; phone?: string; password: string }) {
    const user = await this.users.findOne({ where: [{ email: input.email ?? undefined }, { phone: input.phone ?? undefined }] as any, select: ['id','email','phone','passwordHash','role'] });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const payload = { sub: user.id, role: user.role };
    const access_token = await this.jwt.signAsync(payload);
    return { access_token, user: { id: user.id, email: user.email, phone: user.phone, role: user.role } };
  }
}
