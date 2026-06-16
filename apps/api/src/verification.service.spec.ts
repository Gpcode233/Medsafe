import { VerificationService } from "./verification.service";

describe("VerificationService", () => {
  it("refuses approval while a mandatory check is incomplete", async () => {
    const prisma = {
      verificationClaim: {
        findUnique: jest.fn().mockResolvedValue({
          id: "claim",
          checks: [{ status: "PASSED" }, { status: "MANUAL_REVIEW" }],
        }),
      },
    };
    const service = new VerificationService(prisma as never);
    await expect(service.reviewClaim("claim", {
      reviewerId: "4fd5af6e-16e3-46c5-b2fb-f98f20cc4152",
      decision: "APPROVE",
      reason: "Reviewed",
    })).resolves.toEqual({
      accepted: false,
      reason: "All mandatory assurance checks must pass before approval.",
    });
  });
});
