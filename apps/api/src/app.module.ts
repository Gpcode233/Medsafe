import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verification.service";
import { TraceabilityController } from "./traceability.controller";
import { TraceabilityService } from "./traceability.service";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, VerificationController, TraceabilityController],
  providers: [PrismaService, VerificationService, TraceabilityService],
})
export class AppModule {}
