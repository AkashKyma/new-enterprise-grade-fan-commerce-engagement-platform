import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { PersonalizationModule } from './personalization/personalization.module';
import { ConciergeModule } from './concierge/concierge.module';
import { BrazilModule } from './brazil/brazil.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    HealthModule,
    PersonalizationModule,
    ConciergeModule,
    BrazilModule,
  ],
})
export class AppModule {}
