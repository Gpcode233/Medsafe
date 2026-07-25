import { PrismaClient } from "@prisma/client";
import { createHash, randomUUID } from "node:crypto";

const prisma = new PrismaClient();

export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
export const DEMO_ORG_ID = "22222222-2222-4222-8222-222222222222";
const MANUFACTURER_ORG_ID = "33333333-3333-4333-8333-333333333333";
const DISTRIBUTOR_ORG_ID = "44444444-4444-4444-8444-444444444444";
const PHARMACY_ORG_ID = "55555555-5555-4555-8555-555555555555";

function custodyHash(payload: object, previousHash?: string) {
  return createHash("sha256").update(JSON.stringify({ payload, previousHash })).digest("hex");
}

async function main() {
  await prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: { email: "adegoke@medsafe.ng", fullName: "Adegoke Ibrahim" },
    create: { id: DEMO_USER_ID, email: "adegoke@medsafe.ng", fullName: "Adegoke Ibrahim" },
  });

  const orgs = [
    { id: DEMO_ORG_ID, legalName: "MedSafe Demo Workspace", type: "REGULATOR" as const },
    { id: MANUFACTURER_ORG_ID, legalName: "Novartis Pharma Nigeria Ltd", type: "MANUFACTURER" as const },
    { id: DISTRIBUTOR_ORG_ID, legalName: "Swift Medicals Ltd", type: "DISTRIBUTOR" as const },
    { id: PHARMACY_ORG_ID, legalName: "LUTH Pharmacy, Idi-Araba", type: "PHARMACY" as const },
  ];

  for (const org of orgs) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { legalName: org.legalName, type: org.type, verificationStatus: "VERIFIED" },
      create: { ...org, verificationStatus: "VERIFIED" },
    });
  }

  await prisma.organizationMember.upsert({
    where: { userId_organizationId: { userId: DEMO_USER_ID, organizationId: DEMO_ORG_ID } },
    update: {},
    create: { userId: DEMO_USER_ID, organizationId: DEMO_ORG_ID, title: "Demo operator" },
  });

  const product = await prisma.product.upsert({
    where: { gtin: "61540012345678" },
    update: { name: "Paracetamol Tablets BP 500mg", genericName: "Paracetamol" },
    create: {
      gtin: "61540012345678",
      name: "Paracetamol Tablets BP 500mg",
      genericName: "Paracetamol",
      manufacturerId: MANUFACTURER_ORG_ID,
    },
  });

  const batch = await prisma.batch.upsert({
    where: { productId_batchNumber: { productId: product.id, batchNumber: "PCT500-04125" } },
    update: { status: "ACTIVE", expiresAt: new Date("2027-03-31") },
    create: {
      productId: product.id,
      batchNumber: "PCT500-04125",
      manufacturedAt: new Date("2026-06-12"),
      expiresAt: new Date("2027-03-31"),
      status: "ACTIVE",
    },
  });

  const units = [
    { serial: "89421000318", status: "ACTIVE", custodianId: PHARMACY_ORG_ID },
    { serial: "89421000319", status: "QUARANTINED", custodianId: PHARMACY_ORG_ID },
  ];

  for (const unit of units) {
    const medicineUnit = await prisma.medicineUnit.upsert({
      where: { serial: unit.serial },
      update: { status: unit.status, currentCustodianId: unit.custodianId },
      create: { serial: unit.serial, batchId: batch.id, status: unit.status, currentCustodianId: unit.custodianId },
    });

    const existingEvents = await prisma.custodyEvent.count({ where: { medicineUnitId: medicineUnit.id } });
    if (existingEvents > 0) continue;

    const timeline = [
      { eventType: "MANUFACTURED", receiverOrganizationId: MANUFACTURER_ORG_ID, daysAgo: 3 },
      { eventType: "DISTRIBUTED", receiverOrganizationId: DISTRIBUTOR_ORG_ID, daysAgo: 2 },
      { eventType: "RECEIVED", receiverOrganizationId: PHARMACY_ORG_ID, daysAgo: 1 },
    ];

    let previousHash: string | undefined;
    for (let index = 0; index < timeline.length; index++) {
      const step = timeline[index];
      const id = randomUUID();
      const occurredAt = new Date(Date.now() - step.daysAgo * 86_400_000);
      const payload = {
        id,
        serial: unit.serial,
        eventType: step.eventType,
        receiverOrganizationId: step.receiverOrganizationId,
        occurredAt: occurredAt.toISOString(),
      };
      const eventHash = custodyHash(payload, previousHash);
      await prisma.custodyEvent.create({
        data: {
          id,
          medicineUnitId: medicineUnit.id,
          actorId: DEMO_USER_ID,
          senderOrganizationId: index === 0 ? null : timeline[index - 1].receiverOrganizationId,
          receiverOrganizationId: step.receiverOrganizationId,
          eventType: step.eventType,
          quantity: 1,
          latitude: 6.5244,
          longitude: 3.3792,
          occurredAt,
          previousHash,
          eventHash,
        },
      });
      previousHash = eventHash;
    }
  }

  console.log("Seed complete.");
  console.log("Demo serial (genuine): 89421000318");
  console.log("Demo serial (quarantined): 89421000319");
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
