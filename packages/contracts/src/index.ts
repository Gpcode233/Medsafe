export type PlatformRole =
  | "REGULATOR"
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "PHARMACY"
  | "CLINIC"
  | "HOSPITAL"
  | "PRACTITIONER";

export type VerificationStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "SUSPENDED"
  | "EXPIRED";

export interface RoleEntitlement {
  role: PlatformRole;
  organizationId: string;
  status: VerificationStatus;
  capabilities: string[];
  verifiedAt?: string;
  expiresAt?: string;
}

export interface AuditEvent<T = Record<string, unknown>> {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  actorId: string;
  occurredAt: string;
  payload: T;
  previousHash?: string;
  eventHash: string;
}
