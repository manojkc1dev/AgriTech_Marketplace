# Security & Governance Architecture

## 1. Authentication

- Session/Token management using secure `HttpOnly`, `SameSite=Lax/Strict`, `Secure` cookies to eliminate XSS token theft.

## 2. Role-Based Access Control (RBAC)

- **Platform Roles:** FARMER, BUYER, COOPERATIVE_MANAGER, LOGISTICS_MANAGER, DELIVERY_AGENT.
- **Admin Roles:** SUPER_ADMIN, ADMIN, KYC_ADMIN, OPERATIONS_ADMIN, LOGISTICS_ADMIN, FINANCE_ADMIN, SUPPORT_ADMIN.

## 3. Administrative Protection

- Multi-Factor Authentication (MFA) required for admin accounts.
- Step-up re-authentication required for sensitive operations (role adjustments, user suspensions).

## 4. Sensitive Document Protection

- KYC documents stored in private S3 object storage buckets.
- Served exclusively via short-lived pre-signed URLs (15-minute expiration) generated after server-side permission validation.
