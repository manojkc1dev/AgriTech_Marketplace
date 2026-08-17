# Non-Functional Requirements Document (NFR)

## 1. Security & Compliance

- **Server-Side Security Boundary:** All authorization logic must execute on the backend; frontend checks are exclusively for UI experience.
- **Credential & Secret Protection:** Zero raw password storage (Argon2/PBKDF2 hashing); zero client-side exposed secrets; HttpOnly/SameSite session security.
- **Private Media Protection:** KYC and official documents must never be publicly accessible; pre-signed URLs with maximum 15-minute expiration required.
- **Immutable Audit Logging:** All privilege changes, KYC transitions, login failures, and admin actions must be written to an append-only audit log.

## 2. Architecture & Code Quality

- **Modular Monolith Discipline:** Enforce strict encapsulation between bounded contexts; communication via clear public interfaces or internal domain events.
- **Type Safety:** 100% strict TypeScript on frontend applications (`apps/web`, `apps/admin`) and Python type hinting across `apps/backend`.
- **Test Coverage Target:** Minimum 85% domain unit test coverage and 100% test coverage for authorization/security handlers.

## 3. Reliability & Operational Scalability

- System must gracefully handle isolated database connection loss and log structured JSON errors with correlation IDs (`X-Request-ID`).
- API design must enforce pagination, rate limiting, and request payload limits on all public endpoints.
