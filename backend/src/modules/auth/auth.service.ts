import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IdentityService } from '../identity/identity.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { User } from '../identity/entities';

const WELCOME_POINTS = 500;

@Injectable()
export class AuthService {
  constructor(
    private readonly identity: IdentityService,
    private readonly loyalty: LoyaltyService,
    private jwt: JwtService,
  ) {}

  private tokenFor(user: { id: string; role: User['role'] }) {
    return this.jwt.signAsync({ sub: user.id, role: user.role });
  }

  private userDto(user: { id: string; email: string | null; phone: string | null; role: User['role'] }) {
    return { id: user.id, email: user.email, phone: user.phone, role: user.role };
  }

  /** Profile, sócio ref, and welcome loyalty points for every fan account. */
  private async bootstrapFan(userId: string, email?: string | null) {
    await this.identity.ensureFanRecords(userId, email);
    try {
      await this.loyalty.earn({
        userId,
        amount: WELCOME_POINTS,
        idempotencyKey: `welcome-${userId}`,
        meta: { source: 'signup', note: 'Welcome bonus' },
      });
    } catch {
      /* already earned */
    }
  }

  async signup(input: { email?: string; phone?: string; password: string; role?: User['role'] }) {
    const existing = await this.identity.findByEmailOrPhone({ email: input.email, phone: input.phone });
    if (existing) throw new ConflictException('Account already exists');
    const hash = await bcrypt.hash(input.password, 10);
    const user = await this.identity.createUser({
      email: input.email,
      phone: input.phone,
      passwordHash: hash,
      role: input.role || 'customer',
    });
    await this.bootstrapFan(user.id, user.email);
    const access_token = await this.tokenFor(user);
    return { access_token, user: this.userDto(user) };
  }

  async signin(input: { email?: string; phone?: string; password: string }) {
    const user = await this.identity.findByEmailOrPhone({ email: input.email, phone: input.phone });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    await this.bootstrapFan(user.id, user.email);
    const access_token = await this.tokenFor(user);
    return { access_token, user: this.userDto(user) };
  }
}
