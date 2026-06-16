# MedSafe architecture

## Domain modules

- Identity and access: accounts, MFA, organizations, memberships, entitlements.
- Verification: claims, evidence, registry adapters, checks, reviews, renewals.
- Product identity: product, GTIN, batch, serialized medicine unit, QR payload.
- Traceability: immutable custody events and reconciliation.
- Inventory: stock positions, reservations, adjustments, expiry policy.
- Shipments: containers, routes, handoffs, GPS observations, exceptions.
- Compliance: alerts, cases, recalls, sanctions, inspections, scoring.
- Audit and integration: transactional outbox, event hash chain, adapters.

## Transaction and event model

Every supply-chain command validates the actor's capability and current custody,
then writes domain state, an append-only event, and an outbox record in one
PostgreSQL transaction. An outbox relay publishes only committed records.
Consumers are idempotent by event ID.

Custody events include a hash of their canonical payload and previous event hash.
This makes tampering detectable while PostgreSQL constraints remain the source of
truth. AWS S3 Object Lock can retain exported audit bundles.

## API conventions

- Base path: `/api/v1`
- OAuth 2.1/OIDC for external clients; short-lived JWT access tokens.
- Idempotency keys on writes and bulk imports.
- Cursor pagination for event and inventory feeds.
- Organization and entitlement scopes are derived server-side.
- Integration webhooks are signed, timestamped, replay-protected, and retried.
- OpenAPI schemas and canonical event contracts version independently.

## Evolution to services

The MVP deploys as a modular monolith to preserve transactional correctness and
reduce operational overhead. Verification, notifications, scan risk, reporting,
and integration adapters are the first extraction candidates. Product identity
and custody stay together until cross-service consistency requirements justify
the additional complexity.
