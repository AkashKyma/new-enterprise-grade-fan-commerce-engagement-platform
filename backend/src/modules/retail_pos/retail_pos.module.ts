import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RetailProduct, RetailVariant, RetailLocation, RetailCentralLevel, RetailLocationLevel, RetailStockMovement, RetailSaleReceipt, RetailReturnRecord } from './entities';
import { RetailService } from './retail_pos.service';
import { RetailController } from './retail_pos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RetailProduct, RetailVariant, RetailLocation, RetailCentralLevel, RetailLocationLevel, RetailStockMovement, RetailSaleReceipt, RetailReturnRecord])],
  providers: [RetailService],
  controllers: [RetailController],
  exports: [RetailService],
})
export class RetailPosModule {}
