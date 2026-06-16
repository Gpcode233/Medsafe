import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { IsInt, IsLatitude, IsLongitude, IsString, IsUUID, Min } from "class-validator";
import { TraceabilityService } from "./traceability.service";

class TransferCustodyDto {
  @IsUUID() actorId!: string;
  @IsUUID() senderOrganizationId!: string;
  @IsUUID() receiverOrganizationId!: string;
  @IsString() eventType!: string;
  @IsInt() @Min(1) quantity!: number;
  @IsLatitude() latitude!: number;
  @IsLongitude() longitude!: number;
}

@Controller("medicine-units")
export class TraceabilityController {
  constructor(private readonly service: TraceabilityService) {}

  @Get(":serial/ledger")
  getLedger(@Param("serial") serial: string) { return this.service.getLedger(serial); }

  @Post(":serial/custody-events")
  transfer(@Param("serial") serial: string, @Body() dto: TransferCustodyDto) {
    return this.service.transfer(serial, dto);
  }
}
