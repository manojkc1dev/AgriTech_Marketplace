# Frontend Architecture (apps/web & apps/admin)

## Structure

Both `apps/web` and `apps/admin` are organized by business domain rather than generic component directories:

## Security Rule

- Frontend authorization checks are strictly for UX (hiding/showing buttons and routes).
- Backend APIs enforce actual authorization boundaries on every request.
