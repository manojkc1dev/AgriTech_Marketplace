# ADR 0002: Service Layer & Use Case Separation in DRF

## Context

Standard Django applications lean heavily on fat models or heavy DRF view/serializer logic, making business rules hard to test and maintain.

## Decision

We enforce a Clean Architecture pattern where DRF serializers only validate HTTP payloads and delegate all business actions to explicit Application Use-Case Handlers and Domain Services.

## Consequences

- **Positive:** Domain logic is framework-agnostic, easily unit-testable, and maintainable.
- **Negative:** Requires slightly more boilerplate code per API endpoint.
