import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderLine, Payment, PaymentAttempt, OfflineSyncRecord } from './entities';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderLine, Payment, PaymentAttempt, OfflineSyncRecord])],
  providers: [CheckoutService],
  controllers: [CheckoutController],
  exports: [CheckoutService],
})
export class CheckoutModule {}
