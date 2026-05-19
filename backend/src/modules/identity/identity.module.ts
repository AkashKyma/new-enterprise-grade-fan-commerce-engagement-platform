import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, CustomerProfile, IdentityLink, WalletReference, MembershipReference, BiometricReferencePlaceholder, Session } from './entities';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, CustomerProfile, IdentityLink, WalletReference, MembershipReference, BiometricReferencePlaceholder, Session])],
  providers: [IdentityService],
  controllers: [IdentityController],
  exports: [IdentityService, TypeOrmModule],
})
export class IdentityModule {}
