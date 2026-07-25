"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  api, ApiError, assessMedicineStatus, DEMO_ORG_ID, DEMO_USER_ID, formatEventType, type MedicineLedger,
} from "@/lib/api-client";
import {
  navigationForRole, OVERVIEW_METRICS, pageMeta, ROLE_OPTIONS, ROLE_WORKSPACES,
  verifyActionLabel, type PageKey, type VerifyAction, type WorkspaceRole,
} from "@/lib/role-config";
import {
  Archive, Bell, Buildings, CaretDown, ChartBar, CheckCircle, ClipboardText,
  ClockCounterClockwise, Factory, FileText, FirstAid, Funnel, IdentificationCard,
  List, MagnifyingGlass, MapTrifold, Package, Plus, QrCode, ShieldCheck, SignOut,
  Siren, SlidersHorizontal, Truck, UserCircle, UsersThree, Warning, X
} from "@/components/solar-icons";
import { createElement, FormEvent, ReactNode, useEffect, useRef, useState } from "react";

type Session = {
  name: string;
  email: string;
  role: WorkspaceRole;
  verified: boolean;
  claimId?: string;
};

const incidents = [
  { id: "ALT-2026-0612-007", severity: "Critical", type: "Suspected counterfeit", product: "Paracetamol 500mg", location: "Kano", status: "Active" },
  { id: "ALT-2026-0612-006", severity: "High", type: "Diversion risk", product: "Tramadol 100mg", location: "Onitsha", status: "Under review" },
  { id: "ALT-2026-0612-005", severity: "High", type: "Unregistered product", product: "Artemether 20mg", location: "Aba", status: "Active" },
  { id: "ALT-2026-0612-004", severity: "Medium", type: "Cold chain deviation", product: "Insulin 100IU/ml", location: "Enugu", status: "Investigating" },
  { id: "ALT-2026-0611-019", severity: "Low", type: "Late custody scan", product: "Amoxicillin 500mg", location: "Ibadan", status: "Resolved" },
];

const shipments = [
  { id: "TRK-2026-0958", route: "Lagos → Kano", product: "Coartem 20/120mg", units: "12,400", eta: "14 Jun, 16:30", status: "On time", progress: 72 },
  { id: "TRK-2026-0957", route: "Port Harcourt → Abuja", product: "Insulin 100IU/ml", units: "2,160", eta: "14 Jun, 20:15", status: "Delayed", progress: 48 },
  { id: "TRK-2026-0956", route: "Apapa → Enugu", product: "Amoxicillin 500mg", units: "8,900", eta: "15 Jun, 09:00", status: "On time", progress: 61 },
  { id: "TRK-2026-0955", route: "Lagos → Maiduguri", product: "Tramadol 100mg", units: "4,500", eta: "15 Jun, 18:20", status: "At risk", progress: 34 },
];

const inventory = [
  { product: "Paracetamol Tablets BP 500mg", batch: "PCT500-04125", onHand: 8420, available: 8110, expiry: "Mar 2027", status: "Healthy" },
  { product: "Amoxicillin 500mg Capsules", batch: "AMX500-9182", onHand: 4320, available: 3900, expiry: "Jul 2026", status: "Expiring" },
  { product: "Insulin 100IU/ml", batch: "INS100-3129", onHand: 860, available: 820, expiry: "Jan 2027", status: "Cold chain" },
  { product: "Diclofenac 75mg Injection", batch: "DCF075-7721", onHand: 2150, available: 2040, expiry: "Aug 2026", status: "Expiring" },
  { product: "Artemether/Lumefantrine", batch: "ATM020-4051", onHand: 6740, available: 6588, expiry: "Nov 2027", status: "Healthy" },
];

const ledger = [
  { time: "12 Jun 2026 08:15", event: "Manufactured", actor: "Novartis Pharma AG, Basel", qty: "1,000", hash: "f7c3a0e8b9d2c1e3", status: "Confirmed" },
  { time: "12 Jun 2026 11:23", event: "Exported", actor: "Novartis Export FZE, Dubai", qty: "1,000", hash: "3b1d9f2a7c4d88f1", status: "Confirmed" },
  { time: "13 Jun 2026 03:40", event: "Imported", actor: "Novartis Pharma Nig. Ltd", qty: "1,000", hash: "aa98c6d7e12b4f3c", status: "Confirmed" },
  { time: "14 Jun 2026 10:11", event: "Distributed", actor: "Swift Medicals Ltd, Surulere", qty: "1,000", hash: "91d6e0b3c7a941d0", status: "Confirmed" },
  { time: "15 Jun 2026 09:15", event: "Received", actor: "LUTH Pharmacy, Idi-Araba", qty: "200", hash: "c8e4f55a2b6e1a9d", status: "Confirmed" },
];

export function MedSafeApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [pending, setPending] = useState<Omit<Session, "verified"> | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(open => !open);
      }
      if (event.key === "Escape") setPaletteOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!session && !pending) return <LoginPage onContinue={setPending} />;
  if (!session && pending) {
    return (
      <VerificationGate
        applicant={pending}
        onBack={() => setPending(null)}
        onComplete={(verified, claimId) => {
          setSession({ ...pending, verified, claimId });
          setPage(ROLE_WORKSPACES[pending.role].defaultPage);
        }}
      />
    );
  }

  const availableNavigation = navigationForRole(session!.role);
  const changePage = (next: PageKey) => {
    setPage(next);
    setSidebarOpen(false);
    setPaletteOpen(false);
  };

  return (
    <main className="app-shell">
      <Sidebar
        role={session!.role}
        page={page}
        items={availableNavigation}
        open={sidebarOpen}
        onNavigate={changePage}
        onClose={() => setSidebarOpen(false)}
      />
      <section className="workspace">
        <Topbar
          session={session!}
          search={search}
          onSearch={setSearch}
          onMenu={() => setSidebarOpen(true)}
          onPalette={() => setPaletteOpen(true)}
          onVerify={() => changePage("verify")}
          onLogout={() => { setSession(null); setPending(null); setPage("overview"); }}
        />
        <div className="page">
          <PageHeading page={page} onAction={() => setToast(actionForPage(page))} />
          <PageContent page={page} role={session!.role} search={search} notify={setToast} navigate={changePage} />
        </div>
      </section>
      {paletteOpen && <CommandPalette items={availableNavigation} onClose={() => setPaletteOpen(false)} onNavigate={changePage} />}
      {toast && <div className="toast" role="status"><CheckCircle weight="fill" />{toast}</div>}
    </main>
  );
}

function LoginPage({ onContinue }: { onContinue: (session: Omit<Session, "verified">) => void }) {
  const [name, setName] = useState("Adegoke Ibrahim");
  const [email, setEmail] = useState("adegoke@medsafe.ng");
  const [role, setRole] = useState<WorkspaceRole>("Regulator");
  const selected = ROLE_OPTIONS.find(item => item.role === role)!;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onContinue({ name: name.trim() || "MedSafe User", email: email.trim() || "user@medsafe.ng", role });
  };
  return (
    <main className="auth-layout">
      <section className="auth-brand-panel">
        <Brand light />
        <div className="auth-message">
          <span className="eyebrow light">Nigeria&apos;s trusted medicine network</span>
          <h1>Every medicine.<br />Every movement.<br />Accountable.</h1>
          <p>Secure pharmaceutical traceability for regulators, manufacturers and care providers.</p>
        </div>
        <div className="trust-strip">
          <div><ShieldCheck weight="duotone" /><span><b>100,000+</b> units traceable</span></div>
          <div><ClockCounterClockwise weight="duotone" /><span><b>Immutable</b> event history</span></div>
          <div><UsersThree weight="duotone" /><span><b>Role-based</b> oversight</span></div>
        </div>
      </section>
      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={submit}>
          <div className="mobile-brand"><Brand /></div>
          <span className="eyebrow">Secure workspace</span>
          <h2>Sign in to MedSafe</h2>
          <p>Use your work identity and select the role you are authorized to perform.</p>
          <label className="field"><span>Full name</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required /></label>
          <label className="field"><span>Work email</span><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@organization.ng" required /></label>
          <label className="field">
            <span>User role</span>
            <Select value={role} onValueChange={value => setRole(value as WorkspaceRole)}>
              <SelectTrigger className="role-select" startIcon={createElement(selected.icon, { size: 20, weight: "duotone" })}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map(item => <SelectItem key={item.role} value={item.role}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <small>{selected.description}</small>
          </label>
          <button className="button primary large" type="submit">Continue to verification <span>→</span></button>
          <div className="auth-security"><ShieldCheck weight="duotone" /><span>Your access is logged and protected by role-based controls.</span></div>
        </form>
      </section>
    </main>
  );
}

function VerificationGate({ applicant, onBack, onComplete }: {
  applicant: Omit<Session, "verified">;
  onBack: () => void;
  onComplete: (verified: boolean, claimId?: string) => void;
}) {
  const [license, setLicense] = useState("");
  const [organization, setOrganization] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const workspace = ROLE_WORKSPACES[applicant.role];

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      const claim = await api.submitVerificationClaim({
        userId: DEMO_USER_ID,
        organizationId: DEMO_ORG_ID,
        requestedRole: workspace.platformRole,
        licenseNumber: license.trim(),
        regulator: organization.trim(),
      });
      onComplete(false, claim.id);
    } catch (err) {
      setError(err instanceof ApiError ? "Could not reach MedSafe API. Start the API and run db:seed." : "Verification submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="verification-gate">
      <div className="verification-shell">
        <Brand />
        <div className="stepper"><span className="done">1</span><i /><span className="active">2</span><i /><span>3</span></div>
        <section className="verification-card">
          <div className="verification-icon"><IdentificationCard size={34} weight="duotone" /></div>
          <span className="eyebrow">Identity assurance · Step 2 of 3</span>
          <h1>Verify your {applicant.role.toLowerCase()} role</h1>
          <p>Role selection is a claim. MedSafe validates identity, professional or organization status, and current authorization before enabling transactions.</p>
          <div className="applicant-summary"><UserCircle size={36} weight="duotone" /><div><b>{applicant.name}</b><span>{applicant.email} · {applicant.role}</span></div></div>
          <div className="form-grid">
            <label className="field"><span>{workspace.licenseFieldLabel}</span><input value={license} onChange={e => setLicense(e.target.value)} placeholder={workspace.licensePlaceholder} /></label>
            <label className="field"><span>{workspace.organizationFieldLabel}</span><input value={organization} onChange={e => setOrganization(e.target.value)} placeholder={workspace.organizationPlaceholder} /></label>
          </div>
          <button className="upload-zone" type="button"><IdentificationCard size={28} weight="duotone" /><span><b>Upload supporting credential</b><small>License, appointment letter or premises certificate · PDF, JPG or PNG</small></span><Plus /></button>
          <div className="verification-notice"><ShieldCheck weight="duotone" /><p><b>A document alone does not prove entitlement.</b> Production verification will reconcile identity, registry status, organization control, expiry, sanctions and reviewer approval.</p></div>
          {error && <p className="verify-error">{error}</p>}
          <div className="verification-actions">
            <button className="button ghost" onClick={onBack}>Back</button>
            <button className="button secondary" onClick={() => onComplete(false)}>Skip for development</button>
            <button className="button primary" onClick={() => void submit()} disabled={!license || !organization || submitting}>
              {submitting ? "Submitting..." : "Submit verification"}
            </button>
          </div>
          <small className="dev-note">Development bypass is visibly marked and must be disabled outside non-production environments.</small>
        </section>
      </div>
    </main>
  );
}

function Sidebar({ role, page, items, open, onNavigate, onClose }: {
  role: WorkspaceRole; page: PageKey; items: ReturnType<typeof navigationForRole>; open: boolean; onNavigate: (page: PageKey) => void; onClose: () => void;
}) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-head"><Brand light compact /><button className="mobile-close" onClick={onClose}><X /></button></div>
        <div className="role-label"><span>Workspace</span><b>{role}</b></div>
        <nav aria-label="Primary navigation">
          <span className="nav-section">Operations</span>
          {items.map(item => (
            <button key={item.key} className={page === item.key ? "nav-active" : ""} onClick={() => onNavigate(item.key)}>
              {createElement(item.icon, { size: 20, weight: "duotone" })}<span>{item.label}</span>{item.badge && <em>{item.badge}</em>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="system-status"><i /><span><b>All systems operational</b><small>Last sync 30 seconds ago</small></span></div>
          <span className="environment">MedSafe Enterprise · Development</span>
        </div>
      </aside>
    </>
  );
}

function Topbar({ session, search, onSearch, onMenu, onPalette, onVerify, onLogout }: {
  session: Session; search: string; onSearch: (value: string) => void; onMenu: () => void; onPalette: () => void; onVerify: () => void; onLogout: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <header className="topbar">
      <button className="icon-button menu-button" aria-label="Open navigation" onClick={onMenu}><List /></button>
      <button className="command-search" onClick={onPalette}>
        <MagnifyingGlass /><span>{search || "Search medicine, batch, shipment or entity..."}</span><kbd>Ctrl K</kbd>
      </button>
      <div className="top-actions">
        <button className="button scan-button" onClick={onVerify}><QrCode weight="duotone" /> Scan / verify</button>
        <button className="icon-button notification" aria-label="Notifications"><Bell weight="duotone" /><span>7</span></button>
        <div className="profile-wrap">
          <button className="profile" onClick={() => setProfileOpen(open => !open)}>
            <span className="avatar">{initials(session.name)}</span>
            <span className="profile-copy"><b>{session.name}</b><small>{session.role}{sessionStatus(session)}</small></span>
            <CaretDown />
          </button>
          {profileOpen && <div className="profile-menu">
            <div><b>{session.email}</b><small>{session.role} workspace</small></div>
            <button onClick={onLogout}><SignOut /> Sign out</button>
          </div>}
        </div>
      </div>
    </header>
  );
}

function PageHeading({ page, onAction }: { page: PageKey; onAction: () => void }) {
  const meta = pageMeta[page];
  const labels: Partial<Record<PageKey, string>> = {
    alerts: "Create incident", shipments: "Register shipment", inventory: "Receive stock",
    reports: "Create report", recalls: "Start recall", entities: "Review application", verify: "Connect scanner"
  };
  return (
    <div className="page-heading">
      <div><span className="breadcrumb">MedSafe / {meta.title}</span><h1>{meta.title}</h1><p>{meta.description}</p></div>
      <div className="heading-actions">
        <button className="button ghost"><Funnel /> Filters</button>
        {labels[page] && <button className="button primary" onClick={onAction}><Plus /> {labels[page]}</button>}
      </div>
    </div>
  );
}

function PageContent({ page, role, search, notify, navigate }: {
  page: PageKey; role: WorkspaceRole; search: string; notify: (message: string) => void; navigate: (page: PageKey) => void;
}) {
  if (page === "overview") return <Overview role={role} notify={notify} navigate={navigate} />;
  if (page === "alerts") return <AlertsPage search={search} notify={notify} />;
  if (page === "shipments") return <ShipmentsPage search={search} notify={notify} />;
  if (page === "inventory") return <InventoryPage role={role} search={search} notify={notify} />;
  if (page === "trace") return <TracePage search={search} />;
  if (page === "entities") return <EntitiesPage notify={notify} />;
  if (page === "compliance") return <CompliancePage notify={notify} />;
  if (page === "reports") return <ReportsPage notify={notify} />;
  if (page === "recalls") return <RecallsPage notify={notify} />;
  if (page === "audit") return <AuditPage />;
  return <VerifyPage role={role} notify={notify} />;
}

function Overview({ role, notify, navigate }: { role: WorkspaceRole; notify: (message: string) => void; navigate: (page: PageKey) => void }) {
  const workspace = ROLE_WORKSPACES[role];
  const metrics = OVERVIEW_METRICS[workspace.overviewMetrics];

  const focusContent = {
    Regulator: {
      badge: "Priority Incident",
      badgeType: "danger",
      title: "Suspected Counterfeit Detected",
      status: "Critical",
      details: [
        ["Alert ID", "ALRT-2026-0612-007"], ["Detected", "12 Jun 2026 · 21:18 WAT"],
        ["Product", "Paracetamol 500mg"], ["Location", "Kano Municipal Market"],
        ["Batch", "PCT500-04125"], ["Units affected", "240 units"]
      ],
      confidence: "98% counterfeit confidence",
      primaryBtn: "Open NAFDAC Investigation",
      primaryMsg: "NAFDAC Investigation case opened and audit logged",
      secondaryBtn: "View all alerts",
      secondaryTarget: "alerts" as PageKey
    },
    Manufacturer: {
      badge: "Batch Release Clearance",
      badgeType: "primary",
      title: "Batch PCT500-04125 Ready for Dispatch",
      status: "Verified",
      details: [
        ["GTIN", "061540012345678"], ["Quantity", "10,000 serialized units"],
        ["NAFDAC Reg No", "A4-9182"], ["Manufactured", "10 Jun 2026 · 08:00 WAT"],
        ["QC Passed", "100% Purity & Strength"], ["Hash Chain", "Verified e2e"]
      ],
      confidence: "100% Serialization Integrity",
      primaryBtn: "Authorize Downstream Dispatch",
      primaryMsg: "Batch authorized for distributor dispatch",
      secondaryBtn: "View serialization trace",
      secondaryTarget: "trace" as PageKey
    },
    Distributor: {
      badge: "Active Transport Manifest",
      badgeType: "warning",
      title: "Shipment TRK-2026-0958 In Transit",
      status: "On Time",
      details: [
        ["Route", "Lagos Depot → Kano Hub"], ["Carrier", "Swift Logistics Nig"],
        ["Product", "Coartem 20/120mg"], ["Payload", "12,400 units"],
        ["Cold Chain", "Maintain 2°C - 8°C"], ["ETA", "14 Jun 2026 · 16:30"]
      ],
      confidence: "Optimal Cold-Chain Telemetry",
      primaryBtn: "Log Depot Handoff",
      primaryMsg: "Depot receipt scanner activated",
      secondaryBtn: "View all shipments",
      secondaryTarget: "shipments" as PageKey
    },
    Pharmacist: {
      badge: "Inventory Expiry Alert",
      badgeType: "warning",
      title: "6,470 Units Expiring ≤ 90 Days",
      status: "Action Required",
      details: [
        ["High Risk Batch", "AMX500-9182 (Amoxicillin)"], ["Expiry Date", "July 2026"],
        ["On-Hand Stock", "4,320 units"], ["Total Value", "₦59,200,000"],
        ["Supplier", "NorthStar Pharma"], ["PCN Status", "Active License"]
      ],
      confidence: "First-Expiry First-Out (FEFO) Alert",
      primaryBtn: "Initiate Stock Discount / Transfer",
      primaryMsg: "Stock transfer recommendation generated",
      secondaryBtn: "Check Inventory",
      secondaryTarget: "inventory" as PageKey
    },
    Hospital: {
      badge: "Clinical Supply Alert",
      badgeType: "warning",
      title: "Insulin 100IU Low Stock Level",
      status: "Reorder Needed",
      details: [
        ["Department", "Central Ward Dispensary"], ["On-Hand", "860 units (3 days supply)"],
        ["Reorder Threshold", "1,500 units"], ["Storage Temp", "3.4°C (Normal)"],
        ["HMO Approved", "NHIA / Private HMOs"], ["Last Restock", "04 Jun 2026"]
      ],
      confidence: "Clinical Continuity Guaranteed",
      primaryBtn: "Submit Restock Order",
      primaryMsg: "Reorder purchase request submitted to distributor",
      secondaryBtn: "Manage Inventory",
      secondaryTarget: "inventory" as PageKey
    },
    Clinic: {
      badge: "Point-of-Care Stock",
      badgeType: "primary",
      title: "Vaccine & Essential Drug Inventory",
      status: "Healthy",
      details: [
        ["Facility", "Primary Health Centre, Garki"], ["Storage Condition", "2.8°C (Cold Chain OK)"],
        ["Verified Today", "142 units"], ["Pending Dispense", "18 prescriptions"],
        ["Regulator", "FCT Primary Care Board"], ["Last Audit", "10 Jun 2026"]
      ],
      confidence: "100% Authentic Stock Verified",
      primaryBtn: "Scan & Dispense Medicine",
      primaryMsg: "Opening dispensing scanner",
      secondaryBtn: "View Scan History",
      secondaryTarget: "trace" as PageKey
    },
    Dispenser: {
      badge: "Point of Sale Terminal",
      badgeType: "primary",
      title: "Quick Medicine Verification",
      status: "Terminal Ready",
      details: [
        ["License", "PCN Practitioner #104829"], ["Terminal ID", "POS-LAG-0042"],
        ["Regulated Price (MRP)", "Enforced on Scans"], ["Expiry Hard-Lock", "Enabled"],
        ["NDLEA Controlled Checks", "Active"], ["Scans Today", "148 verified"]
      ],
      confidence: "Instant Anti-Counterfeit Validation",
      primaryBtn: "Scan Product Barcode / QR",
      primaryMsg: "Barcode scanner ready",
      secondaryBtn: "Open Verification Workspace",
      secondaryTarget: "verify" as PageKey
    }
  }[role];

  return (
    <>
      <section className="metrics">{metrics.map(([label, value, detail], index) => <Metric key={label} label={label} value={value} detail={detail} index={index} />)}</section>
      <div className="overview-grid">
        <SupplyMap onRoute={route => notify(`${route} route selected`)} />
        <section className="focus-panel">
          <div className="panel-heading">
            <div><span className={`eyebrow ${focusContent.badgeType}`}>{focusContent.badge}</span><h2>{focusContent.title}</h2></div>
            <Status value={focusContent.status} />
          </div>
          <div className="incident-summary">
            {focusContent.details.map(([label, val]) => <Info key={label} label={label} value={val} />)}
          </div>
          <div className="confidence"><span><b>{focusContent.confidence}</b></span><i><em /></i></div>
          <div className="button-row">
            <button className="button primary" onClick={() => notify(focusContent.primaryMsg)}>{focusContent.primaryBtn}</button>
            <button className="button ghost" onClick={() => navigate(focusContent.secondaryTarget)}>{focusContent.secondaryBtn}</button>
          </div>
        </section>
        <section className="data-panel span-2">
          <div className="panel-heading"><div><span className="eyebrow">Live operations</span><h2>Recent integrity signals ({role} view)</h2></div><button className="text-button" onClick={() => navigate("alerts")}>View all incidents →</button></div>
          <DataTable headers={["Incident", "Severity", "Type", "Product", "Location", "Status"]}>
            {incidents.slice(0, 4).map(row => <tr key={row.id}><td><b>{row.id}</b></td><td><Status value={row.severity} /></td><td>{row.type}</td><td>{row.product}</td><td>{row.location}</td><td><Status value={row.status} /></td></tr>)}
          </DataTable>
        </section>
      </div>
    </>
  );
}

function SupplyMap({ onRoute }: { onRoute: (route: string) => void }) {
  const [zoom, setZoom] = useState(1);
  const [route, setRoute] = useState("Lagos → Kano");
  const choose = (next: string) => { setRoute(next); onRoute(next); };
  return (
    <section className="map-panel">
      <div className="map-head"><div><span className="eyebrow light">Live supply network</span><h2>Medicine movement across Nigeria</h2></div><span className="live-pill"><i /> Live</span></div>
      <div className="map-stage">
        <img src="/nigeria-supply-map.png" alt="Nigeria supply-chain risk and shipment map" style={{ transform: `scale(${zoom})` }} />
        <div className="map-controls"><button onClick={() => setZoom(value => Math.min(1.5, value + .1))}>+</button><button onClick={() => setZoom(value => Math.max(1, value - .1))}>−</button><button onClick={() => setZoom(1)}>◎</button></div>
        <div className="route-key"><b>Route overlays</b><button className={route === "Lagos → Kano" ? "selected" : ""} onClick={() => choose("Lagos → Kano")}><i className="green-line" /> Lagos → Kano</button><button className={route === "Apapa → Enugu" ? "selected" : ""} onClick={() => choose("Apapa → Enugu")}><i className="amber-line" /> Apapa → Enugu</button><button className={route === "Lagos → Maiduguri" ? "selected" : ""} onClick={() => choose("Lagos → Maiduguri")}><i className="red-line" /> Lagos → Maiduguri</button></div>
      </div>
    </section>
  );
}

function AlertsPage({ search, notify }: { search: string; notify: (message: string) => void }) {
  const [severity, setSeverity] = useState("All");
  const filtered = incidents.filter(row => (severity === "All" || row.severity === severity) && matches(row, search));
  return <CollectionPage stats={[["Open incidents", "27"], ["Critical", "15"], ["Under investigation", "8"], ["Resolved this month", "143"]]}>
    <Toolbar searchLabel="Filter incidents" value={severity} options={["All", "Critical", "High", "Medium", "Low"]} onChange={setSeverity} />
    <DataTable headers={["Incident", "Severity", "Type", "Product", "Location", "Status", ""]}>
      {filtered.map(row => <tr key={row.id}><td><b>{row.id}</b><small>12 Jun 2026 · 21:18</small></td><td><Status value={row.severity} /></td><td>{row.type}</td><td>{row.product}</td><td>{row.location}</td><td><Status value={row.status} /></td><td><button className="table-action" onClick={() => notify(`${row.id} assigned to you`)}>Assign to me</button></td></tr>)}
    </DataTable>
  </CollectionPage>;
}

function ShipmentsPage({ search, notify }: { search: string; notify: (message: string) => void }) {
  const [status, setStatus] = useState("All");
  const filtered = shipments.filter(row => (status === "All" || row.status === status) && matches(row, search));
  return <CollectionPage stats={[["In transit", "182"], ["Arriving today", "24"], ["Delayed", "18"], ["Cold-chain monitored", "46"]]}>
    <Toolbar searchLabel="Filter shipments" value={status} options={["All", "On time", "Delayed", "At risk"]} onChange={setStatus} />
    <DataTable headers={["Shipment", "Route", "Medicine", "Units", "ETA", "Progress", "Status", ""]}>
      {filtered.map(row => <tr key={row.id}><td><b>{row.id}</b></td><td>{row.route}</td><td>{row.product}</td><td>{row.units}</td><td>{row.eta}</td><td><div className="progress-cell"><i><em style={{ width: `${row.progress}%` }} /></i><span>{row.progress}%</span></div></td><td><Status value={row.status} /></td><td><button className="table-action" onClick={() => notify(`Tracking ${row.id}`)}>Track</button></td></tr>)}
    </DataTable>
  </CollectionPage>;
}

function InventoryPage({ role, search, notify }: { role: WorkspaceRole; search: string; notify: (message: string) => void }) {
  const [status, setStatus] = useState("All");
  const filtered = inventory.filter(row => (status === "All" || row.status === status) && matches(row, search));
  
  return (
    <CollectionPage stats={[
      ["Units on hand", "22,490"],
      ["Stock-In (Received ⬆)", "+3,410 this week"],
      ["Stock-Out (Dispensed ⬇)", "-1,980 this week"],
      ["Expiring ≤90 days", "6,470 (FEFO Risk)"]
    ]}>
      <Toolbar searchLabel="Filter inventory by condition" value={status} options={["All", "Healthy", "Expiring", "Cold chain"]} onChange={setStatus} />
      <DataTable headers={["Medicine Product", "Batch / Lot", "Stock On Hand", "Stock Movement", "Available", "Expiry FEFO", "Condition", "Actions"]}>
        {filtered.map(row => (
          <tr key={row.batch}>
            <td><b>{row.product}</b></td>
            <td><code>{row.batch}</code></td>
            <td><b>{row.onHand.toLocaleString()} units</b></td>
            <td>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: row.onHand > 5000 ? "#137333" : "#b06000", fontWeight: 600 }}>
                {row.onHand > 5000 ? "⬆ Received (+1,200)" : "⬇ Dispensing High (-840)"}
              </span>
            </td>
            <td>{row.available.toLocaleString()}</td>
            <td><span style={{ color: row.status === "Expiring" ? "#c5221f" : "inherit", fontWeight: row.status === "Expiring" ? 700 : 400 }}>{row.expiry}</span></td>
            <td><Status value={row.status} /></td>
            <td>
              <div style={{ display: "flex", gap: "6px" }}>
                <button className="table-action" onClick={() => notify(`Dispensed 1 unit of ${row.batch}`)}>⬇ Dispense</button>
                <button className="table-action" onClick={() => notify(`Received stock for ${row.batch}`)}>⬆ Restock</button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </CollectionPage>
  );
}

function TracePage({ search }: { search: string }) {
  const filtered = ledger.filter(row => matches(row, search));
  return <div className="content-stack"><section className="trace-search"><QrCode size={42} weight="duotone" /><div><h2>Find a serialized medicine</h2><p>Use the global search or scan a QR code to inspect complete custody history.</p></div><span>GTIN 61540012345678 · Serial 89421000318</span></section><TraceTimeline /><section className="data-panel"><div className="panel-heading"><div><span className="eyebrow">Event stream</span><h2>Chain-of-custody ledger</h2></div><button className="button ghost">Export CSV</button></div><DataTable headers={["Event time", "Event", "Partner / location", "Quantity", "Event hash", "Status"]}>{filtered.map(row => <tr key={row.hash}><td>{row.time}</td><td><b className="green-text">{row.event}</b></td><td>{row.actor}</td><td>{row.qty}</td><td><code>{row.hash}…</code></td><td><Status value={row.status} /></td></tr>)}</DataTable></section></div>;
}

function EntitiesPage({ notify }: { notify: (message: string) => void }) {
  const rows = [
    ["GreenCross Pharmacy Ltd", "Pharmacy premises", "PCN-LAG-20419", "Manual review", "Lagos"],
    ["NorthStar Pharma Nigeria", "Manufacturer", "NAFDAC-MAN-2198", "Verified", "Ogun"],
    ["Dr. Amara Okafor", "Superintendent pharmacist", "PCN-104829", "Pending evidence", "Lagos"],
    ["Swift Medicals Ltd", "Distributor", "NAFDAC-DST-4421", "Verified", "Rivers"],
  ];
  return <CollectionPage stats={[["Registered entities", "8,421"], ["Verified", "7,806"], ["Pending review", "184"], ["Expiring in 30 days", "96"]]}>
    <Toolbar searchLabel="Application status" value="All applications" options={["All applications", "Manual review", "Verified", "Pending evidence"]} onChange={() => {}} />
    <DataTable headers={["Applicant / entity", "Claimed role", "Registry ID", "Assurance state", "State", ""]}>{rows.map(row => <tr key={row[0]}><td><b>{row[0]}</b></td><td>{row[1]}</td><td><code>{row[2]}</code></td><td><Status value={row[3]} /></td><td>{row[4]}</td><td><button className="table-action" onClick={() => notify(`${row[0]} verification case opened`)}>Review</button></td></tr>)}</DataTable>
  </CollectionPage>;
}

function CompliancePage({ notify }: { notify: (message: string) => void }) {
  const obligations = [["Serialization coverage", "96.8%", "Target 98%", "Watch"], ["Custody scan timeliness", "91.4%", "Target 95%", "At risk"], ["License validity", "98.9%", "Target 99%", "Healthy"], ["Cold-chain evidence", "87.6%", "Target 92%", "At risk"]];
  return <div className="content-stack"><section className="compliance-hero"><div><span className="eyebrow light">National compliance score</span><strong>78.4%</strong><p>Up 3.6 percentage points over the previous reporting period.</p></div><div className="ring"><span>78</span></div></section><section className="data-panel"><div className="panel-heading"><div><span className="eyebrow">Control monitoring</span><h2>Key obligations</h2></div><button className="button ghost" onClick={() => notify("Compliance evidence pack generated")}>Generate evidence pack</button></div><DataTable headers={["Control", "Current", "Threshold", "State", "Performance"]}>{obligations.map(row => <tr key={row[0]}><td><b>{row[0]}</b></td><td>{row[1]}</td><td>{row[2]}</td><td><Status value={row[3]} /></td><td><div className="bar"><i style={{ width: row[1] }} /></div></td></tr>)}</DataTable></section></div>;
}

function ReportsPage({ notify }: { notify: (message: string) => void }) {
  const reports = [["National medicine integrity summary", "Regulatory", "12 Jun 2026", "Ready"], ["Cold-chain exception analysis", "Operations", "11 Jun 2026", "Ready"], ["Controlled medicine custody report", "NDLEA", "10 Jun 2026", "Processing"], ["Monthly manufacturer compliance", "Compliance", "01 Jun 2026", "Ready"]];
  return <div className="report-grid">{reports.map((row, index) => <section className="report-card" key={row[0]}><div className="report-icon"><ClipboardText size={28} weight="duotone" /></div><span className="eyebrow">{row[1]}</span><h2>{row[0]}</h2><p>Updated {row[2]} · Includes verified source data and audit references.</p><div><Status value={row[3]} /><button className="text-button" onClick={() => notify(index === 2 ? "Report is still processing" : `${row[0]} download prepared`)}>{index === 2 ? "View progress" : "Download report"} →</button></div></section>)}</div>;
}

function RecallsPage({ notify }: { notify: (message: string) => void }) {
  const recalls = [["RCL-2026-014", "Metformin 500mg", "MET500-8821", "Class I", "82%", "Active"], ["RCL-2026-013", "Ceftriaxone 1g", "CEF001-4102", "Class II", "100%", "Closed"], ["RCL-2026-012", "Cough Syrup 100ml", "CSY100-2918", "Class II", "61%", "Active"]];
  return <CollectionPage stats={[["Active recalls", "3"], ["Affected units", "18,420"], ["Recovered", "14,906"], ["Custodians notified", "342"]]}>
    <DataTable headers={["Recall", "Medicine", "Batch", "Classification", "Recovery", "Status", ""]}>{recalls.map(row => <tr key={row[0]}><td><b>{row[0]}</b></td><td>{row[1]}</td><td><code>{row[2]}</code></td><td><Status value={row[3]} /></td><td><div className="progress-cell"><i><em style={{ width: row[4] }} /></i><span>{row[4]}</span></div></td><td><Status value={row[5]} /></td><td><button className="table-action" onClick={() => notify(`${row[0]} command center opened`)}>Manage</button></td></tr>)}</DataTable>
  </CollectionPage>;
}

function AuditPage() {
  const rows = [["22:41:18", "Adegoke Ibrahim", "INCIDENT_ASSIGNED", "ALT-2026-0612-007", "102.89.41.18", "Success"], ["22:38:02", "system.traceability", "CUSTODY_EVENT_APPENDED", "TRK-2026-0958", "service", "Success"], ["22:31:44", "Amara Okafor", "MEDICINE_VERIFIED", "61540012345678", "197.210.55.9", "Success"], ["22:27:19", "system.compliance", "CONTROL_THRESHOLD_BREACH", "COLD_CHAIN_04", "service", "Warning"], ["22:16:08", "Musa Bello", "INVENTORY_ADJUSTED", "PCT500-04125", "105.112.19.3", "Success"]];
  return <section className="data-panel"><div className="panel-heading"><div><span className="eyebrow">Immutable events</span><h2>13 June 2026</h2></div><button className="button ghost"><SlidersHorizontal /> Event filters</button></div><DataTable headers={["Time (WAT)", "Actor", "Event", "Resource", "Origin", "Result"]}>{rows.map(row => <tr key={row[0]}><td><code>{row[0]}</code></td><td><b>{row[1]}</b></td><td><code>{row[2]}</code></td><td>{row[3]}</td><td>{row[4]}</td><td><Status value={row[5]} /></td></tr>)}</DataTable></section>;
}

function VerifyPage({ role, notify }: { role: WorkspaceRole; notify: (message: string) => void }) {
  const [code, setCode] = useState("61540012345678");
  const [result, setResult] = useState<"idle" | "genuine" | "suspicious">("idle");
  const verify = () => {
    const next = code.endsWith("9") ? "suspicious" : "genuine";
    setResult(next);
    notify(`Verification event logged for ${role} identity.`);
  };

  return (
    <div className="verify-layout">
      <section className="scanner-panel">
        <div className="scan-visual"><QrCode size={84} weight="duotone" /></div>
        <span className="eyebrow">{role} Verification Terminal</span>
        <h2>Scan or enter a medicine code</h2>
        <p>Validate product GTIN, batch expiry hard-lock, regulated benchmark price (MRP), and custody chain under your <b>{role}</b> identity.</p>
        <label className="verify-input">
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="GTIN or serial number (e.g. 61540012345678)" />
          <button onClick={verify}>Verify medicine</button>
        </label>
        <small>Tip: Enter a code ending in 9 to preview a suspicious alert result.</small>
      </section>

      <section className={`result-panel ${result}`}>
        <div className="result-head">
          {result === "idle" ? <QrCode weight="duotone" /> : result === "genuine" ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}
          <div>
            <span className="eyebrow">Verification result</span>
            <h2>{result === "idle" ? "Awaiting scan" : result === "genuine" ? "GENUINE MEDICINE" : "SUSPICIOUS / COUNTERFEIT ALERT"}</h2>
            <p>{result === "idle" ? "Product, price, expiry and custody details will render upon scan." : result === "genuine" ? "Product serialization and current chain-of-custody are valid." : "Duplicate scan pattern detected. Do not dispense!"}</p>
          </div>
        </div>

        {result !== "idle" && (
          <div className="result-details">
            <Info label="Product Name" value="Paracetamol Tablets BP 500mg" />
            <Info label="Batch / Lot" value="PCT500-04125" />
            <Info label="Manufacturer" value="Novartis Pharma Nig. Ltd" />
            <Info label="Current Custodian" value="LUTH Pharmacy, Idi-Araba" />
            <Info label="Expiry Status" value={result === "genuine" ? "VALID (March 2027)" : "EXPIRED / UNVERIFIED"} />
            <Info label="Regulated Price (MRP)" value="₦1,200 / pack (Uniform Pricing)" />
            <Info label="Controlled Substance" value="No (OTC Category)" />
            <Info label="Last Custody Event" value="Received · 15 Jun 2026" />
          </div>
        )}

        {result !== "idle" && (
          <div className="button-row" style={{ marginTop: "1.25rem" }}>
            {role === "Regulator" && (
              <button className="button primary" onClick={() => notify("Incident flagged for NAFDAC investigation")}>Flag Counterfeit to NAFDAC</button>
            )}
            {(role === "Pharmacist" || role === "Dispenser" || role === "Hospital" || role === "Clinic") && (
              <button className="button primary" onClick={() => notify("Medicine dispense recorded and removed from inventory")}>Dispense Medicine & Log Sale</button>
            )}
            {(role === "Manufacturer" || role === "Distributor") && (
              <button className="button primary" onClick={() => notify("Custody transfer scan recorded in chain of custody")}>Record Custody Handoff</button>
            )}
            <button className="button ghost" onClick={() => notify("Price gouging report submitted for review")}>Report Price Gouging</button>
          </div>
        )}
      </section>

      {result !== "idle" && (
        <section className="data-panel full">
          <div className="panel-heading">
            <div><span className="eyebrow">Cryptographic ledger</span><h2>Immutable chain-of-custody timeline</h2></div>
          </div>
          <TraceTimeline />
        </section>
      )}
    </div>
  );
}

function CommandPalette({ items, onClose, onNavigate }: { items: ReturnType<typeof navigationForRole>; onClose: () => void; onNavigate: (page: PageKey) => void }) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);
  const results = items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()));
  return <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}><section className="command-dialog" role="dialog" aria-label="Command menu"><label><MagnifyingGlass /><input ref={input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pages and actions..." /><kbd>Esc</kbd></label><div className="command-results"><span>Navigate</span>{results.map(item => <button key={item.key} onClick={() => onNavigate(item.key)}>{createElement(item.icon, { size: 20, weight: "duotone" })}<span>{item.label}</span><small>Open page</small><b>↵</b></button>)}{!results.length && <p>No matching MedSafe pages.</p>}</div><footer>Use <kbd>↑</kbd><kbd>↓</kbd> to navigate · <kbd>Enter</kbd> to open</footer></section></div>;
}

function CollectionPage({ stats, children }: { stats: string[][]; children: ReactNode }) {
  return <div className="content-stack"><section className="compact-stats">{stats.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</section><section className="data-panel">{children}</section></div>;
}

function Toolbar({ searchLabel, value, options, onChange }: { searchLabel: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="table-toolbar"><div><Funnel /><span>{searchLabel}</span></div><Select value={value} onValueChange={onChange}><SelectTrigger className="toolbar-select"><SelectValue /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select><button className="button ghost"><SlidersHorizontal /> More filters</button></div>;
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="table-scroll"><table><thead><tr>{headers.map((header, index) => <th key={`${header}-${index}`}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function TraceTimeline() {
  return <div className="trace-timeline">{[["Manufactured", "Basel, Switzerland", "12 Jun · 08:15"], ["Imported", "Apapa, Lagos", "13 Jun · 03:40"], ["Distributed", "Surulere, Lagos", "14 Jun · 10:11"], ["Received", "Idi-Araba, Lagos", "15 Jun · 09:15"]].map(([label, location, time], index) => <div key={label}><span>{index + 1}<CheckCircle weight="fill" /></span><b>{label}</b><small>{location}</small><em>{time}</em></div>)}</div>;
}

function Metric({ label, value, detail, index }: { label: string; value: string; detail: string; index: number }) {
  const icons = [Package, QrCode, Siren, Truck];
  const MetricIcon = icons[index] || ChartBar;
  return <div className="metric"><span className={`metric-icon tone-${index}`}><MetricIcon size={24} weight="duotone" /></span><div><small>{label}</small><strong>{value}</strong><span>{detail}</span></div></div>;
}

function Status({ value }: { value: string }) {
  const slug = value.toLowerCase().replaceAll(" ", "-");
  return <span className={`status status-${slug}`}><i />{value}</span>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="info"><span>{label}</span><b>{value}</b></div>;
}

function Brand({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return <div className={`brand ${light ? "light" : ""} ${compact ? "compact" : ""}`}><span><ShieldCheck size={30} weight="duotone" /></span><div><b>MedSafe<em>+</em></b>{!compact && <small>Trusted medicine network</small>}</div></div>;
}

function matches(record: object, query: string) {
  if (!query.trim()) return true;
  return Object.values(record).join(" ").toLowerCase().includes(query.toLowerCase());
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function actionForPage(page: PageKey) {
  const messages: Partial<Record<PageKey, string>> = {
    alerts: "New incident form opened", shipments: "Shipment registration started", inventory: "Stock receipt workflow started",
    reports: "Report builder opened", recalls: "Recall workflow started", entities: "Verification queue opened", verify: "Scanner connection requested"
  };
  return messages[page] || "Action completed";
}

function sessionStatus(session: Session) {
  return session.verified ? " · Verified" : " · Pending verification";
}
