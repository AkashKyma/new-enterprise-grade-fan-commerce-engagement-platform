import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly svc: LoyaltyService) {}

  @Get(':userId/balance')
  balance(@Param('userId') userId: string) { return this.svc.balance(userId); }

  @Get(':userId/history')
  history(@Param('userId') userId: string) { return this.svc.history(userId); }

  @Post('earn')
  earn(@Body() b: { userId: string; amount: number; idempotencyKey: string; meta?: any }) { return this.svc.earn(b); }

  @Post('redeem')
  redeem(@Body() b: { userId: string; rewardId: string; idempotencyKey: string }) { return this.svc.redeem(b); }

  @Get('rewards')
  rewards() { return this.svc.listRewards(); }

  @Post('rewards')
  upsert(@Body() b: { id?: string; name: string; cost: number; payload?: any; active?: boolean }) { return this.svc.upsertReward(b); }
}
