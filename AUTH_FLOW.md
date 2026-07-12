# GraphGST AI Auth Flow

This document replaces the current frontend demo auth behavior.

## Frontend Mock Being Replaced

Current behavior:
- `authenticationService.login()` creates `demo-access-token`.
- `authenticationService.register()` creates a local session.
- `authenticationService.refreshSession()` refreshes from local demo token.
- `ProtectedRoute` auto-logs in as demo unless explicit logout exists.
- `api.ts` attaches token from local storage.

## Required Auth Model

Session response:
```json
{
  "user": {
    "id": "USR-001",
    "name": "Jane Doe",
    "email": "jane@acme.example",
    "role": "CFO",
    "organizationId": "ORG-ACME",
    "organizationName": "Acme Corp"
  },
  "accessToken": "jwt",
  "refreshToken": "refresh-token",
  "expiresAt": "2026-07-12T15:30:00+05:30"
}
```

## Endpoints

### POST `/api/auth/login`
Request:
```json
{ "email": "jane@acme.example", "password": "secret" }
```
Response: session response.

### POST `/api/auth/register`
Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@acme.example",
  "password": "secret",
  "organizationName": "Acme Corp"
}
```
Response: session response.

### POST `/api/auth/refresh`
Request:
```json
{ "refreshToken": "refresh-token" }
```
Response:
```json
{
  "accessToken": "new-jwt",
  "refreshToken": "new-refresh-token",
  "expiresAt": "2026-07-12T16:30:00+05:30"
}
```

### POST `/api/auth/logout`
Request:
```json
{ "refreshToken": "refresh-token" }
```
Response:
```json
{ "ok": true }
```

### GET `/api/auth/me`
Response:
```json
{
  "id": "USR-001",
  "name": "Jane Doe",
  "email": "jane@acme.example",
  "role": "CFO",
  "organizationId": "ORG-ACME",
  "organizationName": "Acme Corp"
}
```

## Token Rules

- Access token: short lived, 15 to 60 minutes.
- Refresh token: long lived, stored hashed in DB.
- Rotate refresh token on every refresh.
- Revoke refresh token on logout.
- Return `401` when access token is expired or invalid.
- Return `403` when user lacks role/organization permission.

## Protected Route Behavior

Production behavior should be:
1. Check access token.
2. If missing, redirect to `/login`.
3. If expired, call `/api/auth/refresh`.
4. If refresh succeeds, continue.
5. If refresh fails, clear session and redirect to `/login`.

There must be no automatic demo business data creation.

## Dev Shell Access Before Backend

The frontend may provide a local "Continue in Dev Shell" control while backend auth is not connected.

Rules:
- Dev shell only writes a local token such as `dev-shell-access`.
- Dev shell unlocks navigation and layout only.
- Dev shell must not create vendors, cases, invoices, reports, alerts, graph nodes, approvals, actions, dashboard metrics, or AI answers.
- Pages should show empty/backend-not-connected states until real APIs return data.
- Production deployments should hide or disable dev shell access.

## Database Entities Required

- `organizations`
- `users`
- `auth_sessions`
- `audit_logs`

## Security Checklist

- Hash passwords with Argon2 or bcrypt.
- Store only refresh token hash.
- Add organization scoping to every endpoint.
- Add role-based authorization for approvals, reports, and admin operations.
- Add login audit events.
- Add rate limiting to login/register.
- Add CSRF strategy if refresh token moves to cookies.
