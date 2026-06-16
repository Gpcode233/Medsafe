import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { IsEnum, IsIn, IsString, IsUUID, MinLength } from "class-validator";
import { VerificationService } from "./verification.service";

enum ClaimRole {
  REGULATOR = "REGULATOR",
  MANUFACTURER = "MANUFACTURER",
  DISTRIBUTOR = "DISTRIBUTOR",
  PHARMACY = "PHARMACY",
  CLINIC = "CLINIC",
  HOSPITAL = "HOSPITAL",
  PRACTITIONER = "PRACTITIONER",
}

class SubmitClaimDto {
  @IsUUID() userId!: string;
  @IsUUID() organizationId!: string;
  @IsEnum(ClaimRole) requestedRole!: ClaimRole;
  @IsString() @MinLength(3) licenseNumber!: string;
  @IsString() regulator!: string;
}

class ReviewClaimDto {
  @IsUUID() reviewerId!: string;
  @IsIn(["APPROVE", "REJECT", "REQUEST_INFO"]) decision!: "APPROVE" | "REJECT" | "REQUEST_INFO";
  @IsString() reason!: string;
}

@Controller("verification-claims")
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  @Get(":id")
  getClaim(@Param("id") id: string) { return this.service.getClaim(id); }

  @Post()
  submitClaim(@Body() dto: SubmitClaimDto) { return this.service.submitClaim(dto); }

  @Patch(":id/review")
  reviewClaim(@Param("id") id: string, @Body() dto: ReviewClaimDto) {
    return this.service.reviewClaim(id, dto);
  }
}
