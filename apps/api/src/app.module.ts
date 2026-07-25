import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verification.service";
import { TraceabilityController } from "./traceability.controller";
import { TraceabilityService } from "./traceability.service";
import { HmoController } from "./hmo.controller";
import { HmoService } from "./hmo.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, VerificationController, TraceabilityController, HmoController],
  providers: [PrismaService, VerificationService, TraceabilityService, HmoService],
})
export class AppModule {}
