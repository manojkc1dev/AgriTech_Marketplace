# Core System Business Rules (BR)

- **BR-AUTH-001:** Users with incomplete or unapproved KYC applications are restricted to read-only access in the marketplace and cannot create listings, submit offers, or place orders.
- **BR-KYC-001:** KYC state transitions must adhere strictly to the sequence: `DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` or `REJECTED` or `RESUBMISSION_REQUIRED`. Arbitrary state jumps are strictly rejected.
- **BR-NEG-001:** Submitting a counter-offer automatically invalidates and supercedes all prior pending offers in that negotiation thread.
- **BR-ORD-001:** Order state transitions must strictly progress forward (`PENDING` -> `CONFIRMED` -> `PROCESSING` -> `FULFILLING` -> `DISPATCHED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`). Backward transitions are forbidden except through explicit cancellation workflows.
- **BR-SEC-001:** Administrative users must not have permissions automatically granted across domains (e.g., a KYC Admin cannot modify administrator accounts or grant roles).
- **BR-SEC-002:** Super Admin actions involving permission modifications, role grants, or account suspensions require active re-authentication or step-up MFA verification.
