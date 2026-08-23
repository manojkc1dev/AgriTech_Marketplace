# Confirmed Business Rules

## BR-001 — Buyer KYC Requirement

A buyer must have an approved KYC status before purchasing agricultural produce.

Rule:

Buyer
→ KYC Submitted
→ KYC Approved
→ Purchase permitted

If KYC is not approved:
Purchase = DENIED

## BR-002 — Farmer/Seller KYC Requirement

A farmer/seller must have an approved KYC status before selling agricultural produce through the platform.

Rule:

Farmer/Seller
→ KYC Submitted
→ KYC Approved
→ Selling permitted

If KYC is not approved:
Selling = DENIED

## BR-003 — Farmer Cooperative Membership

A farmer can belong to only one cooperative.

Cardinality:

Cooperative 1 ─────── N Farmers

Farmer N ─────── 1 Cooperative

A farmer cannot simultaneously belong to multiple cooperatives.

## BR-004 — Cooperative Manager Scope

A Cooperative Manager may manage multiple cooperatives.

Cardinality:

Cooperative Manager 1 ─────── N Cooperatives

## BR-005 — Independent Farmer Selling

A farmer who belongs to a cooperative cannot independently sell produce through the platform.

Produce selling must occur through the farmer's associated cooperative.

Farmer
↓
Cooperative
↓
Produce
↓
Marketplace

## BR-006 — Cooperative Logistics

The cooperative is responsible for logistics operations associated with its produce.

The exact logistics responsibilities include:

- produce collection
- collection coordination
- handover
- transportation coordination
- delivery coordination

The detailed operational boundary must be defined during logistics design.

## BR-007 — Administrative Farmer Management

Authorized platform administrators can manage farmer/seller accounts according to their permissions.

Administrative access must be permission-based and not automatically granted to every administrator.

## BR-008 — Super Admin Authority

Super Admin has the highest administrative authority.

Super Admin can manage:

- administrators
- cooperative administration
- farmers
- buyers
- cooperatives
- platform configuration
- administrative permissions

Super Admin cannot bypass audit requirements.

## BR-009 — Administrative Separation

Platform users and administrative users are separate authorization domains.

Platform users:

- Farmer
- Buyer
- Cooperative Manager
- Logistics Manager
- Delivery Agent

Administrative users:

- Super Admin
- Admin
- KYC Admin
- Operations Admin
- Logistics Admin
- Finance Admin
- Support Admin


## BR-010 — Cooperative Registration Approval

**Status:** OPEN — Business decision required.

The proposed business rule is:

Cooperative Manager approves cooperative registration.

The authority for creating/approving the first Cooperative Manager has not yet been finalized.

See:

`docs/requirements/requirements-audit.md`
→ OBD-001 — Cooperative Registration Approval

This rule must be finalized before implementing cooperative onboarding.