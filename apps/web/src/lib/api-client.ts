import type { PlatformRole } from "@medsafe/contracts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(body || response.statusText, response.status);
  }
  return response.json() as Promise<T>;
}

export type VerificationClaim = {
  id: string;
  status: string;
  requestedRole: PlatformRole;
  licenseNumber: string;
  regulator: string;
  createdAt: string;
};

export type CustodyEventRecord = {
  id: string;
  eventType: string;
  quantity: number;
  occurredAt: string;
  eventHash: string;
  previousHash: string | null;
  receiverOrganizationId: string;
};

export type MedicineLedger = {
  id: string;
  serial: string;
  status: string;
  batch: {
    batchNumber: string;
    expiresAt: string;
    product: {
      gtin: string;
      name: string;
      genericName: string | null;
    };
  };
  custodyEvents: CustodyEventRecord[];
};

/** Demo IDs from prisma seed — used until real auth is implemented. */
export const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
export const DEMO_ORG_ID = "22222222-2222-4222-8222-222222222222";

export const api = {
  health: () => request<{ status: string }>("/health"),

  submitVerificationClaim(input: {
    userId: string;
    organizationId: string;
    requestedRole: PlatformRole;
    licenseNumber: string;
    regulator: string;
  }) {
    return request<VerificationClaim>("/verification-claims", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getVerificationClaim(id: string) {
    return request<VerificationClaim>(`/verification-claims/${id}`);
  },

  getMedicineLedger(serial: string) {
    return request<MedicineLedger>(`/medicine-units/${encodeURIComponent(serial)}/ledger`);
  },
};

export function assessMedicineStatus(unit: MedicineLedger): "genuine" | "suspicious" {
  const risky = ["QUARANTINED", "RECALLED", "SUSPECT", "COUNTERFEIT", "EXPIRED"];
  return risky.includes(unit.status.toUpperCase()) ? "suspicious" : "genuine";
}

export function formatEventType(eventType: string) {
  return eventType
    .split(/[._]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}
