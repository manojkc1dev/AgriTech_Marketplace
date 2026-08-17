# Domain Model Specification

## 1. Identity & Access Context

- **User (Aggregate Root):**
  - _Entities:_ UserProfile, MFA Secret.
  - _Value Objects:_ Email, PasswordHash, Role (PlatformRole / AdminRole), UserStatus.
  - _Domain Events:_ `UserRegistered`, `AdminMFAEnabled`, `UserSuspended`, `UserReactivated`.

## 2. KYC & Compliance Context

- **KYCApplication (Aggregate Root):**
  - _Entities:_ DocumentRecord, VerificationReview.
  - _Value Objects:_ DocumentMetadata, VerificationStatus (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`), RejectionReason.
  - _Domain Events:_ `KYCSubmitted`, `KYCUnderReview`, `KYCApproved`, `KYCRejected`.

## 3. Producer Context

- **Farm / Cooperative (Aggregate Roots):**
  - _Entities:_ CollectionCenter, MemberRoster (Co-op).
  - _Value Objects:_ GeoLocation, FarmSize, CertificationNumber.
  - _Domain Events:_ `FarmRegistered`, `CooperativeMemberAdded`, `CollectionCenterCreated`.

## 4. Catalog & Inventory Context

- **ProduceBatch (Aggregate Root):**
  - _Entities:_ BatchInventory.
  - _Value Objects:_ HarvestDate, Quantity, CropCategory, OriginTrace.
  - _Domain Events:_ `ProduceBatchCreated`, `InventoryDepleted`, `BatchExpired`.

## 5. Marketplace & Negotiation Context

- **Listing (Aggregate Root):**
  - _Value Objects:_ UnitPrice, AvailableQuantity, ExpirationDate, ListingStatus.
  - _Domain Events:_ `ListingPublished`, `ListingCancelled`.
- **NegotiationThread (Aggregate Root):**
  - _Entities:_ Offer.
  - _Value Objects:_ OfferPrice, OfferQuantity, NegotiationStatus (`OPEN`, `COUNTERED`, `ACCEPTED`, `REJECTED`, `EXPIRED`).
  - _Domain Events:_ `OfferSubmitted`, `CounterOfferSubmitted`, `NegotiationAccepted`, `NegotiationRejected`.

## 6. Orders & Quality Context

- **Order (Aggregate Root):**
  - _Entities:_ OrderItem, FulfillmentAllocation.
  - _Value Objects:_ TotalAmount, OrderStatus (`PENDING`, `CONFIRMED`, `PROCESSING`, `FULFILLING`, `DISPATCHED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`).
  - _Domain Events:_ `OrderPlaced`, `OrderConfirmed`, `FulfillmentAllocated`, `OrderCancelled`.
- **QualityInspection (Aggregate Root):**
  - _Value Objects:_ QualityGrade (`GRADE_A`, `GRADE_B`, `REJECTED`), InspectionNotes, SampleWeight.
  - _Domain Events:_ `QualityInspectionPassed`, `QualityInspectionFailed`.

## 7. Logistics Context

- **Shipment (Aggregate Root):**
  - _Entities:_ PickupTask, TransitLeg.
  - _Value Objects:_ TrackingNumber, ShipmentStatus (`SCHEDULED`, `IN_TRANSIT`, `AT_HUB`, `OUT_FOR_DELIVERY`, `DELIVERED`), ProofOfDelivery.
  - _Domain Events:_ `PickupScheduled`, `DriverAssigned`, `HubArrived`, `ShipmentDelivered`, `DeliveryFailed`.

## 8. Audit Context

- **AuditRecord (Aggregate Root):**
  - _Value Objects:_ ActorID, ActionType, TargetResource, IPAddress, CorrelationID, Timestamp.
  - _Domain Events:_ `AuditRecordLogged`.
