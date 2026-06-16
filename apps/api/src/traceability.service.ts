import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { PrismaService } from "./prisma.service";

type Transfer = { actorId: string; senderOrganizationId: string; receiverOrganizationId: string; eventType: string; quantity: number; latitude: number; longitude: number };

@Injectable()
export class TraceabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getLedger(serial: string) {
    const unit = await this.prisma.medicineUnit.findUnique({ where: { serial }, include: { batch: { include: { product: true } }, custodyEvents: { orderBy: { occurredAt: "asc" } } } });
    if (!unit) throw new NotFoundException("Medicine unit not found");
    return unit;
  }

  async transfer(serial: string, input: Transfer) {
    return this.prisma.$transaction(async tx => {
      const unit = await tx.medicineUnit.findUnique({ where: { serial } });
      if (!unit) throw new NotFoundException("Medicine unit not found");
      if (unit.currentCustodianId !== input.senderOrganizationId) throw new ConflictException("Sender is not the recorded custodian");
      const previous = await tx.custodyEvent.findFirst({ where: { medicineUnitId: unit.id }, orderBy: { occurredAt: "desc" } });
      const id = randomUUID();
      const occurredAt = new Date();
      const eventHash = createHash("sha256").update(JSON.stringify({ id, serial, input, occurredAt, previousHash: previous?.eventHash })).digest("hex");
      const event = await tx.custodyEvent.create({
        data: { id, medicineUnitId: unit.id, actorId: input.actorId, senderOrganizationId: input.senderOrganizationId, receiverOrganizationId: input.receiverOrganizationId, eventType: input.eventType, quantity: input.quantity, latitude: input.latitude, longitude: input.longitude, occurredAt, previousHash: previous?.eventHash, eventHash },
      });
      await tx.medicineUnit.update({ where: { id: unit.id }, data: { currentCustodianId: input.receiverOrganizationId } });
      await tx.outboxEvent.create({ data: { id: randomUUID(), eventType: "custody.transferred", aggregateType: "MedicineUnit", aggregateId: unit.id, actorId: input.actorId, occurredAt, payload: input, eventHash } });
      return event;
    }, { isolationLevel: "Serializable" });
  }
}
