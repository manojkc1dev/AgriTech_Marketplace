# Context Map

## Context Relationship Types

1. **Identity -> All Contexts:** Shared Kernel / Customer-Supplier. Provides authenticated user principal and permission contexts.
2. **KYC -> Producer/Marketplace:** Upstream Conformist. Marketplace restricts actions until KYC emits `KYCApproved`.
3. **Marketplace -> Orders:** Upstream / Downstream. Order context consumes accepted negotiation terms or listing parameters.
4. **Orders -> Logistics:** Customer / Supplier. Confirmed orders trigger shipment and pickup task creation.
5. **All Contexts -> Audit Logging:** Asynchronous Event Publisher / Subscriber. Audit context captures domain events without blocking execution.
