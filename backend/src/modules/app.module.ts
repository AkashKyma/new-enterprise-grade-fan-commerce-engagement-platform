import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { IdentityModule } from './identity/identity.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { MembershipTicketingModule } from './membership_ticketing/membership_ticketing.module';
import { CheckoutModule } from './checkout/checkout.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { CdpModule } from './cdp/cdp.module';
import { RetailPosModule } from './retail_pos/retail_pos.module';
import { FnbPosModule } from './fnb_pos/fnb_pos.module';
import { PersonalizationModule } from './personalization/personalization.module';
import { ConciergeModule } from './concierge/concierge.module';
import { BrazilModule } from './brazil/brazil.module';
import { SeedModule } from '../seeds/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'fan_platform',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // ── core ──────────────────────────────────────────────
    HealthModule,
    AuthModule,
    IdentityModule,

    // ── commerce & operations ─────────────────────────────
    LoyaltyModule,
    MembershipTicketingModule,
    CheckoutModule,
    MarketplaceModule,
    RetailPosModule,
    FnbPosModule,

    // ── marketing & intelligence ──────────────────────────
    CdpModule,
    PersonalizationModule,
    ConciergeModule,

    // ── brazil adapters ───────────────────────────────────
    BrazilModule,

    // ── demo data (SEED_DEMO=false to disable) ────────────
    SeedModule,
  ],
})
export class AppModule {}
