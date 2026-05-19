import { Module } from '@nestjs/common';
import { GupshupAdapter } from './gupshup.adapter';
import { ZenviaAdapter } from './zenvia.adapter';

@Module({ providers: [GupshupAdapter, ZenviaAdapter], exports: [GupshupAdapter, ZenviaAdapter] })
export class BrazilModule {}
