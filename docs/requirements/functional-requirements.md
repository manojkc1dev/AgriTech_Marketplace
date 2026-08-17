# Functional Requirements Document (FRD)

## 1. Identity & Access Control

- Centralized registration and authentication supporting email/password and secure session tokens.
- Strict Role-Based Access Control (RBAC) separating Platform Roles from Admin Roles.
- Administrative Multi-Factor Authentication (MFA) and step-up authorization for critical actions.

## 2. KYC & Compliance

- Document upload pipeline (PAN, Citizenship, Land records, Co-op licenses) targeting secure private storage.
- Explicit state machine transition management (`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` / `REJECTED`).
- Comprehensive audit records for every status transition and administrative document view.

## 3. Produce Catalog & Inventory Management

- Categorized crop listings specifying batch origin, harvest date, location, and total quantity.
- Quality Control grading (Grade A, Grade B, Rejected) tied directly to batch inventory.

## 4. Marketplace, Demand & Negotiation

- Public listing catalog with multi-attribute filtering (grade, region, price, crop type).
- Formal Demand creation by buyers (RFQs specifying volume, price target, delivery date).
- State-driven negotiation mechanism supporting offer, counter-offer, acceptance, rejection, and expiration.

## 5. Orders, Fulfillment & Logistics

- Explicit multi-stage order lifecycle management (`PENDING` through `DELIVERED`).
- Fulfillment mapping connecting orders to specific harvest batches or collection center inventory.
- Logistics dispatching: Field pickup scheduling, hub transfer logging, driver route assignment, and proof-of-delivery confirmation.

## 6. Admin Application Interface

- Dedicated, completely separate frontend application (`apps/admin`) tailored for administrative personas.
- Dedicated modules for KYC review, user suspension/reactivation, logistics exception handling, and immutable audit log inspection.
