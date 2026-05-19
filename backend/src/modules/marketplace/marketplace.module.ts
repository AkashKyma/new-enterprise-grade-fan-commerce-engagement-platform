import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor, MarketplaceItem, Cart, CartLine, MpOrder, MpOrderLine, SettlementRef } from './entities';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, MarketplaceItem, Cart, CartLine, MpOrder, MpOrderLine, SettlementRef])],
  providers: [MarketplaceService],
  controllers: [MarketplaceController],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
