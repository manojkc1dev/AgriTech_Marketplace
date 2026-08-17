# AgriTech System Architecture Overview

## Architecture Style

- **Pattern:** Modular Monolith inside a Monorepo (`agritech-platform/`).
- **Core Principle:** API-First design with strict DDD domain encapsulation.

## Monorepo Layout

## Non-Negotiable Boundaries

- Microservices, Kafka, and Kubernetes are explicitly forbidden at this phase.
- Communication between bounded contexts in `apps/backend` happens via in-process application services or internal domain events.
- Database access across contexts must be executed through domain repositories, avoiding foreign-key coupling across distinct bounded contexts where appropriate.
