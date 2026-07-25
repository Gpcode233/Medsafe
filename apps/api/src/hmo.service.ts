import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

type ValidateClaimDto = {
  claimNumber: string;
  hmoCode: string;
  serial: string;
  claimedAmount: number;
};

@Injectable()
export class HmoService {
  constructor(private readonly prisma: PrismaService) {}

  async validateAndRecordClaim(input: ValidateClaimDto) {
    const unit = await this.prisma.medicineUnit.findUnique({
      where: { serial: input.serial },
      include: {
        batch: { include: { product: true } },
        custodyEvents: { orderBy: { occurredAt: "desc" }, take: 1 },
      },
    });

    if (!unit) {
      throw new NotFoundException(`Medicine unit with serial ${input.serial} not found.`);
    }

    const latestEvent = unit.custodyEvents[0];
    if (!latestEvent) {
      throw new NotFoundException(`No valid custody event history found for medicine serial ${input.serial}.`);
    }

    const claim = await this.prisma.hmoClaim.create({
      data: {
        claimNumber: input.claimNumber,
        hmoCode: input.hmoCode,
        medicineUnitId: unit.id,
        claimedAmount: input.claimedAmount,
        verificationStatus: "VERIFIED",
        eventHash: latestEvent.eventHash,
      },
    });

    return {
      success: true,
      claimId: claim.id,
      claimNumber: claim.claimNumber,
      serial: input.serial,
      productName: unit.batch.product.name,
      gtin: unit.batch.product.gtin,
      batchNumber: unit.batch.batchNumber,
      expiryDate: unit.batch.expiresAt,
      maxRetailPrice: unit.batch.product.maxRetailPrice,
      authentic: true,
      latestEventHash: latestEvent.eventHash,
      verifiedAt: claim.createdAt,
    };
  }
}
