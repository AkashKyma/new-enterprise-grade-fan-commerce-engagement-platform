import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, CustomerProfile, IdentityLink, WalletReference, MembershipReference, BiometricReferencePlaceholder, Session } from './entities';

@Injectable()
export class IdentityService {
  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(CustomerProfile) private profiles: Repository<CustomerProfile>,
    @InjectRepository(IdentityLink) private links: Repository<IdentityLink>,
    @InjectRepository(WalletReference) private wallets: Repository<WalletReference>,
    @InjectRepository(MembershipReference) private memberships: Repository<MembershipReference>,
    @InjectRepository(BiometricReferencePlaceholder) private biometrics: Repository<BiometricReferencePlaceholder>,
    @InjectRepository(Session) private sessions: Repository<Session>,
  ) {}

  async createUser(payload: { email?: string; phone?: string; passwordHash?: string; role?: User['role'] }) {
    const u = this.users.create({ email: payload.email || null, phone: payload.phone || null, passwordHash: payload.passwordHash || null, role: payload.role || 'customer' });
    const user = await this.users.save(u);
    const profile = this.profiles.create({ userId: user.id, traits: {} });
    await this.profiles.save(profile);
    await this.wallets.save(this.wallets.create({ userId: user.id, meta: {} }));
    await this.memberships.save(this.memberships.create({ userId: user.id, membershipId: null, meta: {} }));
    await this.biometrics.save(this.biometrics.create({ userId: user.id, status: 'pending', providerMeta: {} }));
    return user;
  }

  async findByEmailOrPhone(identifier: { email?: string; phone?: string }) {
    return this.users.findOne({ where: [{ email: identifier.email ?? undefined }, { phone: identifier.phone ?? undefined }] as any, select: ['id','email','phone','passwordHash','role','createdAt','updatedAt'] });
  }

  async linkProvider(userId: string, provider: string, providerId: string, meta: Record<string, any> = {}) {
    return this.links.save(this.links.create({ userId, provider, providerId, meta }));
  }

  async getProfile(userId: string) {
    const [user, profile, wallet, member, bio] = await Promise.all([
      this.users.findOne({ where: { id: userId } }),
      this.profiles.findOne({ where: { userId } }),
      this.wallets.findOne({ where: { userId } }),
      this.memberships.findOne({ where: { userId } }),
      this.biometrics.findOne({ where: { userId } }),
    ]);
    return { user, profile, wallet, membership: member, biometric: bio };
  }

  async createSession(userId: string, jwtId: string) {
    return this.sessions.save(this.sessions.create({ userId, jwtId, active: true }));
  }
}
