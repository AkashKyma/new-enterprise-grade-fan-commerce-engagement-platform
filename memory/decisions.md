# Decisions (THU-6)
- Minimal segmentation engine (trait path or eventType) for speed; extensible later.
- Channel providers abstracted; V1 writes ChannelDispatch records for delivery workers.
- Journeys entity included; execution engine deferred to next ticket.
