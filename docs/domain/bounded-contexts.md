# Bounded Contexts Specification

1. **Identity & Access (`identity`, `access_control`):**
   - _Responsibility:_ User identity, authentication, platform roles, admin roles, permissions, MFA, session security.
2. **KYC & Verification (`kyc`):**
   - _Responsibility:_ Application state machine, identity documents, verification records, reviewer assignments.
3. **Producer Management (`farmers`, `cooperatives`):**
   - _Responsibility:_ Farm profiles, co-op memberships, collection center locations, producer rosters.
4. **Catalog & Inventory (`catalog`, `inventory`):**
   - _Responsibility:_ Crop classifications, produce batches, harvest details, available inventory counts.
5. **Marketplace & Negotiations (`marketplace`, `demand`, `negotiation`):**
   - _Responsibility:_ Produce listings, buyer demand RFQs, counter-offer state tracking, contract locking.
6. **Orders & Fulfillment (`orders`, `fulfillment`, `quality`):**
   - _Responsibility:_ Order line items, fulfillment allocation, quality grading checks, order state progression.
7. **Logistics & Delivery (`logistics`):**
   - _Responsibility:_ Field pickups, transit shipments, hub handling, driver route assignments, proof-of-delivery.
8. **Audit & Operations (`audit`, `analytics`):**
   - _Responsibility:_ Append-only security audit events, system metric aggregations, operational dashboards.
