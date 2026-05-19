import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CdpService } from './cdp.service';
import { CdpController } from './cdp.controller';
import { CdpEvent, CdpProfile, Segment, Campaign, Journey, Template, ChannelDispatch } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([CdpEvent, CdpProfile, Segment, Campaign, Journey, Template, ChannelDispatch])],
  providers: [CdpService],
  controllers: [CdpController],
  exports: [CdpService],
})
export class CdpModule {}
