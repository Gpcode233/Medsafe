# AWS deployment baseline

MedSafe is packaged as a modular monolith for the MVP. Module boundaries and
outbox events allow high-volume domains to be split into services without first
rewriting business logic.

## Runtime

- Route 53 and AWS WAF in front of CloudFront.
- Next.js web container and NestJS API containers on ECS Fargate across three
  availability zones.
- Application Load Balancer for API traffic and service health checks.
- Aurora PostgreSQL-compatible or RDS PostgreSQL Multi-AZ as the source of truth.
- ElastiCache Redis for read caching, throttling, idempotency, and duplicate-scan
  windows. Redis is never the authoritative custody record.
- S3 with versioning, Object Lock, SSE-KMS, malware scanning, and short-lived
  presigned URLs for verification evidence.
- An outbox relay publishes committed events to EventBridge. SQS queues isolate
  audit projection, notifications, integrations, and fraud detection consumers.
- CloudWatch, X-Ray/OpenTelemetry, GuardDuty, Security Hub, and CloudTrail provide
  operational and security telemetry.

## Scale assumptions

- Medicine units are indexed by serial, batch, custodian, and status.
- Custody events are append-only and indexed by unit plus event time.
- API tasks scale horizontally; no in-memory session state is required.
- Bulk unit registration uses asynchronous jobs and PostgreSQL `COPY`.
- Read-heavy regulator views use projections fed by committed outbox events.
- Database connection pooling uses RDS Proxy or PgBouncer.
- Initial load target: 100,000 units, with a partitioning threshold reviewed at
  tens of millions of custody events.

## Integration boundary

External systems connect through versioned adapters:

- `regulator.nafdac`
- `regulator.ndlea`
- `registry.pcn`
- `registry.mdcn`
- `identity.nimc`
- `organization.cac`
- `insurance.hmo`
- `logistics.provider`
- `health.national`

Adapters consume canonical contracts and store external request IDs, response
hashes, timestamps, and consent/legal basis. Provider outages move checks to
manual review; they never silently approve a claim.
