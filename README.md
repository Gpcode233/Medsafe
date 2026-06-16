# MedSafe+

Enterprise pharmaceutical traceability, verification, inventory, shipment, and
regulatory oversight platform.

## Local development

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

- Web: `http://localhost:3000`
- API health: `http://localhost:4000/api/v1/health`

## Repository

- `apps/web`: role-adaptive Next.js operations interface.
- `apps/api`: NestJS domain API and Prisma persistence.
- `packages/contracts`: canonical integration and event types.
- `docs`: architecture and identity assurance policy.
- `infra`: AWS deployment baseline.

The MVP is intentionally a modular monolith with event-driven boundaries. This
keeps medicine custody updates transactional while allowing independent services
to be extracted as volume and organizational ownership grow.
