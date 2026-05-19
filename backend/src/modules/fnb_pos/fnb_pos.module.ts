import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FnbProduct, FnbOutlet, FnbInventoryLevel, FnbStockMovement, FnbReceipt } from './entities';
import { FnbService } from './fnb_pos.service';
import { FnbController } from './fnb_pos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FnbProduct, FnbOutlet, FnbInventoryLevel, FnbStockMovement, FnbReceipt])],
  providers: [FnbService],
  controllers: [FnbController],
  exports: [FnbService],
})
export class FnbPosModule {}
