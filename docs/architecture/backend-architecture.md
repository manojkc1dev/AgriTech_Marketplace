# Backend Modular Monolith Architecture

## DDD Layered Structure per Bounded Context

Every domain in `apps/backend/src/<context>/` must follow the layer flow:

## Architectural Standard

- Business logic MUST NOT reside in DRF serializers or views. Serializers perform schema validation and DTO mapping only.
- Domain models and application handlers are pure Python constructs decoupled from HTTP or framework internals.
