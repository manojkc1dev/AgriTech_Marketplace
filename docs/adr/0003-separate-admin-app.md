# ADR 0003: Standalone React Administration Application

## Context

Platform administration requires specialized workflows (KYC auditing, RBAC controls, logistics exception handling) distinct from standard buyer/seller dashboards.

## Decision

Create `apps/admin` as a completely isolated React application deployed independently from `apps/web`.

## Consequences

- **Positive:** Complete security and bundle isolation between user and admin applications.
- **Negative:** Shared UI components must be maintained in `packages/` or shared modules.
