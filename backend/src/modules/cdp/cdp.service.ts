import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CdpEvent, CdpProfile, Segment, Campaign, Journey, Template, ChannelDispatch } from './entities';

@Injectable()
export class CdpService {
  constructor(
    @InjectRepository(CdpEvent) private events: Repository<CdpEvent>,
    @InjectRepository(CdpProfile) private profiles: Repository<CdpProfile>,
    @InjectRepository(Segment) private segments: Repository<Segment>,
    @InjectRepository(Campaign) private campaigns: Repository<Campaign>,
    @InjectRepository(Journey) private journeys: Repository<Journey>,
    @InjectRepository(Template) private templates: Repository<Template>,
    @InjectRepository(ChannelDispatch) private dispatches: Repository<ChannelDispatch>,
  ) {}

  async ingest(ev: { userId: string; type: string; payload?: any }) {
    const e = this.events.create({ userId: ev.userId, type: ev.type, payload: ev.payload || {} });
    const saved = await this.events.save(e);
    // simple enrichment: ensure profile exists
    let prof = await this.profiles.findOne({ where: { userId: ev.userId } });
    if (!prof) prof = await this.profiles.save(this.profiles.create({ userId: ev.userId, traits: {} }));
    // naive enrichment example: update lastEvent
    prof.traits.lastEvent = ev.type;
    await this.profiles.save(prof);
    return saved;
  }

  async upsertSegment(input: { id?: string; name: string; criteria: any }) {
    const seg = this.segments.create({ ...(input.id ? { id: input.id } : {}), name: input.name, criteria: input.criteria });
    return this.segments.save(seg);
  }

  async runSegment(id: string) {
    const seg = await this.segments.findOneOrFail({ where: { id } });
    // very simple criteria: { trait: { path: value } } or { eventType: signup }
    const where: any = {};
    if (seg.criteria?.trait && seg.criteria.trait.path && seg.criteria.trait.value !== undefined) {
      // fetch profiles and filter in memory for demo
      const all = await this.profiles.find();
      const matched = all.filter(p => {
        const parts = String(seg.criteria.trait.path).split('.');
        let v: any = p.traits;
        for (const part of parts) v = v?.[part];
        return v === seg.criteria.trait.value;
      });
      return matched.map(p => p.userId);
    }
    if (seg.criteria?.eventType) {
      const recents = await this.events.find({ where: { type: seg.criteria.eventType } });
      return Array.from(new Set(recents.map(r => r.userId)));
    }
    return [];
  }

  async createTemplate(input: { name: string; channel: string; body: string }) {
    return this.templates.save(this.templates.create(input));
  }

  async createCampaign(input: { name: string; config: any }) {
    return this.campaigns.save(this.campaigns.create({ name: input.name, config: input.config }));
  }

  async triggerCampaign(id: string) {
    const camp = await this.campaigns.findOneOrFail({ where: { id } });
    const { segmentId, channel, templateId } = camp.config || {};
    const userIds = await this.runSegment(segmentId);
    const tpl = await this.templates.findOneOrFail({ where: { id: templateId } });
    // enqueue dispatches (abstracted provider)
    const rows = await Promise.all(userIds.map(uid => this.dispatches.save(this.dispatches.create({ userId: uid, channel: channel || tpl.channel, payload: { templateId: tpl.id, body: tpl.body } }))));
    return { dispatched: rows.length };
  }
}
