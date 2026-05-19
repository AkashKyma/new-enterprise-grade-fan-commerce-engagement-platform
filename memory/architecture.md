# Architecture Notes (THU-6)
- CDP module stores unified profiles and events.
- Segmentation criteria kept simple for V1 (trait path equals; eventType match).
- Campaigns reference segment + template; trigger enqueues ChannelDispatch rows (provider adapters to be wired later for WhatsApp/push; email/SMS later).
