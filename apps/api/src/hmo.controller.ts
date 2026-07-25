import { Body, Controller, Post } from "@nestjs/common";
import { HmoService } from "./hmo.service";

@Controller("api/v1/hmo")
export class HmoController {
  constructor(private readonly hmoService: HmoService) {}

  @Post("verify-claim")
  verifyClaim(@Body() body: { claimNumber: string; hmoCode: string; serial: string; claimedAmount: number }) {
    return this.hmoService.validateAndRecordClaim(body);
  }
}
