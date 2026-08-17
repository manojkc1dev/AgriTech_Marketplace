# ADR 0004: HttpOnly Cookie-Based Authentication

## Context

Storing authentication JWTs in client `localStorage` exposes tokens to cross-site scripting (XSS) attacks.

## Decision

All authentication tokens will be transmitted via secure, `HttpOnly`, `SameSite` cookies managed by the backend.

## Consequences

- **Positive:** Mitigation of XSS token extraction risks.
- **Negative:** Requires strict CORS and CSRF protection handling on server APIs.
