import type { PlatformRole } from "@medsafe/contracts";
import {
  Archive, Buildings, ChartBar, ChatCircle, ClockCounterClockwise, Factory, FileText,
  FirstAid, IdentificationCard, MapTrifold, Package, ShieldCheck, Siren, Truck,
} from "@/components/solar-icons";
import type { ReactNode } from "react";

export type WorkspaceRole =
  | "Regulator"
  | "Manufacturer"
  | "Distributor"
  | "Pharmacist"
  | "Hospital"
  | "Clinic";

export type PageKey =
  | "overview"
  | "messages"
  | "alerts"
  | "shipments"
  | "inventory"
  | "trace"
  | "entities"
  | "compliance"
  | "reports"
  | "recalls"
  | "audit"
  | "verify";

export type Icon = (props: {
  size?: number;
  weight?: "regular" | "duotone" | "fill";
  className?: string;
}) => ReactNode;

export type VerifyAction = "openInvestigation" | "quarantine" | "reportIncident";

export type MetricSet = "national" | "facility" | "logistics" | "production";

type NavItem = { key: PageKey; label: string; icon: Icon; badge?: string };

export const NAV_ITEMS: NavItem[] = [
  { key: "overview", label: "Overview", icon: MapTrifold },
  { key: "messages", label: "Supply Chain Chat", icon: ChatCircle, badge: "3" },
  { key: "alerts", label: "Alerts & incidents", icon: Siren, badge: "15" },
  { key: "shipments", label: "Shipments", icon: Truck },
  { key: "inventory", label: "Inventory", icon: Archive },
  { key: "trace", label: "Drug traceability", icon: ClockCounterClockwise },
  { key: "entities", label: "Licenses & entities", icon: IdentificationCard },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "reports", label: "Reports & analytics", icon: ChartBar },
  { key: "recalls", label: "Recall management", icon: Package },
  { key: "audit", label: "Audit trail", icon: FileText },
];

export type RoleWorkspace = {
  platformRole: PlatformRole;
  label: string;
  description: string;
  icon: Icon;
  defaultPage: PageKey;
  navKeys: PageKey[];
  overviewMetrics: MetricSet;
  verifyActions: VerifyAction[];
  licenseFieldLabel: string;
  organizationFieldLabel: string;
  licensePlaceholder: string;
  organizationPlaceholder: string;
};

export const ROLE_WORKSPACES: Record<WorkspaceRole, RoleWorkspace> = {
  Regulator: {
    platformRole: "REGULATOR",
    label: "Regulator",
    description: "National or state medicine oversight (NAFDAC / NDLEA / FMoH)",
    icon: ShieldCheck,
    defaultPage: "overview",
    navKeys: ["overview", "messages", "alerts", "entities", "compliance", "recalls", "audit", "trace", "reports"],
    overviewMetrics: "national",
    verifyActions: ["openInvestigation", "reportIncident"],
    licenseFieldLabel: "Agency staff ID",
    organizationFieldLabel: "Agency / directorate",
    licensePlaceholder: "e.g. NAF/HQ/10482",
    organizationPlaceholder: "NAFDAC, Investigation & Enforcement",
  },
  Manufacturer: {
    platformRole: "MANUFACTURER",
    label: "Manufacturer",
    description: "Pharmaceutical production, batch release & export custody",
    icon: Factory,
    defaultPage: "shipments",
    navKeys: ["overview", "messages", "shipments", "trace", "entities", "recalls", "inventory", "reports", "audit"],
    overviewMetrics: "production",
    verifyActions: ["reportIncident"],
    licenseFieldLabel: "NAFDAC establishment number",
    organizationFieldLabel: "Registered organization",
    licensePlaceholder: "e.g. MAN-002918",
    organizationPlaceholder: "Registered organization name",
  },
  Distributor: {
    platformRole: "DISTRIBUTOR",
    label: "Distributor / Wholesaler",
    description: "Wholesale distribution, transit logistics & depot custody",
    icon: Truck,
    defaultPage: "shipments",
    navKeys: ["overview", "messages", "shipments", "inventory", "trace", "verify", "alerts", "recalls"],
    overviewMetrics: "logistics",
    verifyActions: ["quarantine", "reportIncident"],
    licenseFieldLabel: "NAFDAC distributor permit number",
    organizationFieldLabel: "Distributor / logistics hub",
    licensePlaceholder: "e.g. NAF-DST-99182",
    organizationPlaceholder: "Registered distribution company",
  },
  Pharmacist: {
    platformRole: "PHARMACY",
    label: "Pharmacy / Licensed Dispenser",
    description: "Retail pharmacy, patent medicine store & POS dispensing",
    icon: FirstAid,
    defaultPage: "inventory",
    navKeys: ["overview", "messages", "inventory", "verify", "trace", "recalls", "alerts", "shipments"],
    overviewMetrics: "facility",
    verifyActions: ["quarantine", "reportIncident"],
    licenseFieldLabel: "PCN registration number",
    organizationFieldLabel: "Pharmacy / facility",
    licensePlaceholder: "e.g. PCN-123456",
    organizationPlaceholder: "Registered pharmacy name",
  },
  Hospital: {
    platformRole: "HOSPITAL",
    label: "Hospital / Health Center",
    description: "Ward inventory, emergency restocking & clinical dispensing",
    icon: Buildings,
    defaultPage: "inventory",
    navKeys: ["overview", "messages", "inventory", "verify", "trace", "shipments", "recalls", "alerts"],
    overviewMetrics: "facility",
    verifyActions: ["quarantine", "reportIncident"],
    licenseFieldLabel: "Facility license number",
    organizationFieldLabel: "Hospital / facility",
    licensePlaceholder: "e.g. HOS-LAG-4412",
    organizationPlaceholder: "Registered hospital name",
  },
  Clinic: {
    platformRole: "CLINIC",
    label: "Clinic / Primary Care",
    description: "Point-of-care medicine inventory & patient administration",
    icon: FirstAid,
    defaultPage: "inventory",
    navKeys: ["overview", "messages", "inventory", "verify", "trace", "alerts", "shipments"],
    overviewMetrics: "facility",
    verifyActions: ["quarantine", "reportIncident"],
    licenseFieldLabel: "Facility registration number",
    organizationFieldLabel: "Clinic / facility",
    licensePlaceholder: "e.g. CLN-ABJ-8821",
    organizationPlaceholder: "Registered clinic name",
  },
};

export const ROLE_OPTIONS = (Object.keys(ROLE_WORKSPACES) as WorkspaceRole[]).map(role => ({
  role,
  ...ROLE_WORKSPACES[role],
}));

export const OVERVIEW_METRICS: Record<MetricSet, [string, string, string][]> = {
  national: [
    ["Tracked medicine units", "104,238", "+4,812 today"],
    ["Authenticity scans", "58,693", "88.4% genuine"],
    ["Active alerts", "27", "15 critical"],
    ["Shipments in transit", "182", "83.5% on time"],
  ],
  production: [
    ["Serialized batches", "412", "+18 this month"],
    ["Units released", "1.2M", "100% hash chained"],
    ["Active distributors", "48", "All verified"],
    ["Recalls / alerts", "1", "0 critical"],
  ],
  logistics: [
    ["Active shipments", "38", "12 arriving today"],
    ["On-time delivery", "94.2%", "Within SLA"],
    ["Cold chain status", "100%", "0 deviations"],
    ["Depot inventory", "42,100", "4 locations"],
  ],
  facility: [
    ["Units on hand", "22,490", "+1,220 this week"],
    ["Verified scans", "3,842", "99.2% genuine"],
    ["Expiring ≤90 days", "6,470", "₦59.2M value"],
    ["Open exceptions", "8", "2 require action"],
  ],
};

export const pageMeta: Record<PageKey, { title: string; description: string }> = {
  overview: { title: "National medicine overview", description: "Live integrity, movement and compliance signals across the supply chain." },
  messages: { title: "Supply chain network chat", description: "Direct encrypted communication between regulators, manufacturers, distributors and healthcare providers." },
  alerts: { title: "Alerts & incidents", description: "Triage integrity threats, assign investigations and coordinate response." },
  shipments: { title: "Shipment tracking", description: "Monitor custody transfers, route risk, ETAs and delivery exceptions." },
  inventory: { title: "Medicine inventory & stock movement", description: "Track stock in (received) vs stock out (dispensed), FEFO risk and expiry." },
  trace: { title: "Drug traceability", description: "Follow every serialized unit from manufacture to dispensing." },
  entities: { title: "Licenses & entities", description: "Verify organizations, practitioners, premises and operating permissions." },
  compliance: { title: "Compliance monitoring", description: "Track obligations, exceptions and corrective actions by stakeholder." },
  reports: { title: "Reports & analytics", description: "Generate decision-ready supply, risk and compliance intelligence." },
  recalls: { title: "Recall management", description: "Locate affected units, notify custodians and measure recovery progress." },
  audit: { title: "Audit trail", description: "Review immutable activity events across all MedSafe services." },
  verify: { title: "Scan & verify medicine", description: "Validate product identity, serialization and current chain of custody." },
};

export function navigationForRole(role: WorkspaceRole) {
  const keys = new Set(ROLE_WORKSPACES[role].navKeys);
  return NAV_ITEMS.filter(item => keys.has(item.key));
}

export function verifyActionLabel(action: VerifyAction) {
  const labels: Record<VerifyAction, string> = {
    openInvestigation: "Open investigation",
    quarantine: "Quarantine batch",
    reportIncident: "Report incident",
  };
  return labels[action];
}
