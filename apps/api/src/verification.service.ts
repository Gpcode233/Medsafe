import { Injectable, NotFoundException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { PrismaService } from "./prisma.service";

type SubmitClaim = { userId: string; organizationId: string; requestedRole: string; licenseNumber: string; regulator: string };
type ReviewClaim = { reviewerId: string; decision: "APPROVE" | "REJECT" | "REQUEST_INFO"; reason: string };

@Injectable()
export class VerificationService {
  constructor(private readonly prisma: PrismaService) {}

  getClaim(id: string) {
    return this.prisma.verificationClaim.findUnique({
      where: { id },
      include: { checks: true, evidence: true, organization: true, user: true },
    });
  }

  async submitClaim(input: SubmitClaim) {
    return this.prisma.$transaction(async tx => {
      const claim = await tx.verificationClaim.create({
        data: {
          userId: input.userId,
          organizationId: input.organizationId,
          requestedRole: input.requestedRole as never,
          licenseNumber: input.licenseNumber,
          regulator: input.regulator,
          status: "PENDING",
        },
      });
      await tx.outboxEvent.create({
        data: this.event("verification.claim.submitted", "VerificationClaim", claim.id, input.userId, input),
      });
      return claim;
    });
  }

  async reviewClaim(id: string, input: ReviewClaim) {
    const existing = await this.prisma.verificationClaim.findUnique({ where: { id }, include: { checks: true } });
    if (!existing) throw new NotFoundException("Verification claim not found");
    const passed = existing.checks.every(check => check.status === "PASSED");
    if (input.decision === "APPROVE" && !passed) {
      return { accepted: false, reason: "All mandatory assurance checks must pass before approval." };
    }
    const status = input.decision === "APPROVE" ? "VERIFIED" : input.decision === "REJECT" ? "REJECTED" : "IN_REVIEW";
    return this.prisma.$transaction(async tx => {
      const claim = await tx.verificationClaim.update({ where: { id }, data: { status, reviewedById: input.reviewerId, reviewedAt: new Date(), reviewReason: input.reason } });
      if (input.decision === "APPROVE") {
        await tx.roleEntitlement.create({
          data: { userId: claim.userId, organizationId: claim.organizationId, role: claim.requestedRole, sourceClaimId: claim.id, status: "VERIFIED" },
        });
      }
      await tx.outboxEvent.create({
        data: this.event(`verification.claim.${input.decision.toLowerCase()}`, "VerificationClaim", id, input.reviewerId, { reason: input.reason }),
      });
      return claim;
    });
  }

  private event(eventType: string, aggregateType: string, aggregateId: string, actorId: string, payload: object) {
    const id = randomUUID();
    const occurredAt = new Date();
    const eventHash = createHash("sha256").update(JSON.stringify({ id, eventType, aggregateType, aggregateId, actorId, occurredAt, payload })).digest("hex");
    return { id, eventType, aggregateType, aggregateId, actorId, occurredAt, payload, eventHash };
  }
}
