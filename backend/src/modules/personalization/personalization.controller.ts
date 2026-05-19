import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PersonalizationService } from './personalization.service';

@Controller('personalization')
export class PersonalizationController {
  constructor(private readonly svc: PersonalizationService) {}
  @Post('next-best-action') nba(@Body() b: { userId?: string; context?: any }) { return this.svc.nextBestAction(b); }
  @Get('offers') offers(@Query('userId') userId?: string) { return this.svc.offers({ userId }); }
  @Get('rewards') rewards(@Query('userId') userId?: string) { return this.svc.rewards({ userId }); }
  @Get('events') events(@Query('userId') userId?: string) { return this.svc.events({ userId }); }
  @Get('blocks') blocks(@Query('userId') userId?: string) { return this.svc.blocks({ userId }); }
}
