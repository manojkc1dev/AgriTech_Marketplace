# Minimum Viable Product (MVP) Scope Boundary

## Included in MVP (Phase 1 Slice)

- Monorepo structure with `apps/backend`, `apps/web`, `apps/admin`.
- Modular Monolith architecture in Django with DDD-inspired domain boundaries.
- Identity management, RBAC enforcement, session handling, and Admin MFA.
- Complete KYC workflow with secure document upload and Admin review interface.
- Producer management (Farmer profiles, Farm registration, Cooperative aggregation).
- Produce catalog with batch grading and inventory tracking.
- Marketplace listing, RFQ demand creation, and counter-offer negotiations.
- Order processing pipeline with fulfillment allocation.
- Milestone-based logistics tracking (Field Pickup -> Collection Center -> Hub -> Delivery).
- Immutable audit log recorder for sensitive security and administrative actions.

## Deferred Beyond MVP

- AI-driven dynamic price prediction and crop disease diagnosis models.
- Live real-time GPS streaming map tracking for logistics vehicles.
- Third-party micro-escrow multi-party financial split automation.
- Multi-region language localization and offline PWA capability.
