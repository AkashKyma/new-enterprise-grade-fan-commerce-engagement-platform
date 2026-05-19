# Architecture Notes (THU-5)
- Identity module exposes entities: User, CustomerProfile, IdentityLink, WalletReference, MembershipReference, BiometricReferencePlaceholder, Session.
- Auth module provides JWT-based auth. Guard-protected endpoints use Bearer token.
- Future modules (membership, ticketing, loyalty, marketplace, retail, FnB, concierge) must reference userId.
