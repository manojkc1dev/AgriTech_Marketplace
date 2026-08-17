# ADR 0001: Modular Monolith Monorepo Architecture

## Context

We require a maintainable, enterprise-capable backend and dual frontend applications without the operational overhead of microservices.

## Decision

We adopt a Monorepo containing a Python/Django Modular Monolith (`apps/backend`) and two distinct React TS applications (`apps/web` and `apps/admin`).

## Consequences

- **Positive:** Simplified cross-domain debugging, zero network latency between contexts, unified deployment, easy future microservice extraction.
- **Negative:** Requires disciplined domain encapsulation to prevent domain leakages in monolithic backend code.
