"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createElement, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Role = "Regulator" | "Manufacturer" | "Pharmacist" | "Hospital" | "Clinic" | "Dispenser";
type PageKey = "overview" | "alerts" | "shipments" | "inventory" | "trace" | "entities" | "compliance" | "reports" | "recalls" | "audit" | "verify";
type Session = { name: string; email: string; role: Role; verified: boolean };
type Icon = (props: { size?: number; weight?: "regular" | "duotone" | "fill"; className?: string }) => ReactNode;

function appIcon(label: string): Icon {
  return function AppIcon({ size = 20, weight = "duotone", className }) {
    return (
      <span
        className={`app-icon ${weight === "fill" ? "app-icon-fill" : ""} ${className || ""}`}
        style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.48)) }}
        aria-hidden="true"
      >
        {label}
      </span>
    );
  };
}

const ShieldCheck = appIcon("SC");
const Factory = appIcon("MF");
const FirstAid = appIcon("MD");
const Buildings = appIcon("HP");
const IdentificationCard = appIcon("ID");
const MapTrifold = appIcon("MP");
const Siren = appIcon("AL");
const Truck = appIcon("TR");
const Archive = appIcon("IV");
const ClockCounterClockwise = appIcon("TL");
const ChartBar = appIcon("CH");
const Package = appIcon("PK");
const FileText = appIcon("DC");
const QrCode = appIcon("QR");
const ClipboardText = appIcon("RP");
const Bell = appIcon("NT");
const CaretDown = appIcon("V");
const CheckCircle = appIcon("OK");
const Plus = appIcon("+");
const MagnifyingGlass = appIcon("S");
const Funnel = appIcon("FL");
const SignOut = appIcon("LO");
const SlidersHorizontal = appIcon("SL");
const UserCircle = appIcon("US");
const UsersThree = appIcon("GR");
const Warning = appIcon("!");
const X = appIcon("X");
const List = appIcon("M");

const roles: { role: Role; label: string; description: string; icon: Icon }[] = [
  { role: "Regulator", label: "Regulator", description: "National or state medicine oversight", icon: ShieldCheck },
  { role: "Manufacturer", label: "Manufacturer", description: "Production, release and downstream custody", icon: Factory },
  { role: "Pharmacist", label: "Pharmacy / Pharmacist", description: "Verification, dispensing and stock control", icon: FirstAid },
  { role: "Hospital", label: "Hospital", description: "Facility inventory and clinical supply", icon: Buildings },
  { role: "Clinic", label: "Clinic", description: "Point-of-care medicine operations", icon: FirstAid },
  { role: "Dispenser", label: "Licensed Dispenser", description: "Verified dispensing and stock custody", icon: IdentificationCard },
];

const navigation: { key: PageKey; label: string; icon: Icon; roles?: Role[]; badge?: string }[] = [
  { key: "overview", label: "Overview", icon: MapTrifold },
  { key: "alerts", label: "Alerts & incidents", icon: Siren, badge: "15" },
  { key: "shipments", label: "Shipments", icon: Truck },
  { key: "inventory", label: "Inventory", icon: Archive, roles: ["Pharmacist", "Hospital", "Clinic", "Dispenser"] },
  { key: "trace", label: "Drug traceability", icon: ClockCounterClockwise },
  { key: "entities", label: "Licenses & entities", icon: IdentificationCard, roles: ["Regulator", "Manufacturer"] },
  { key: "compliance", label: "Compliance", icon: ShieldCheck },
  { key: "reports", label: "Reports & analytics", icon: ChartBar },
  { key: "recalls", label: "Recall management", icon: Package, roles: ["Regulator", "Manufacturer", "Pharmacist", "Hospital"] },
  { key: "audit", label: "Audit trail", icon: FileText },
];

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

const pageMeta: Record<PageKey, { title: string; description: string }> = {
  overview: { title: "National medicine overview", description: "Live integrity, movement and compliance signals across the supply chain." },
  alerts: { title: "Alerts & incidents", description: "Triage integrity threats, assign investigations and coordinate response." },
  shipments: { title: "Shipment tracking", description: "Monitor custody transfers, route risk, ETAs and delivery exceptions." },
  inventory: { title: "Medicine inventory", description: "Control stock by batch, expiry, availability and storage condition." },
  trace: { title: "Drug traceability", description: "Follow every serialized unit from manufacture to dispensing." },
  entities: { title: "Licenses & entities", description: "Verify organizations, practitioners, premises and operating permissions." },
  compliance: { title: "Compliance monitoring", description: "Track obligations, exceptions and corrective actions by stakeholder." },
  reports: { title: "Reports & analytics", description: "Generate decision-ready supply, risk and compliance intelligence." },
  recalls: { title: "Recall management", description: "Locate affected units, notify custodians and measure recovery progress." },
  audit: { title: "Audit trail", description: "Review immutable activity events across all MedSafe services." },
  verify: { title: "Scan & verify medicine", description: "Validate product identity, serialization and current chain of custody." },
};

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
    return <VerificationGate applicant={pending} onBack={() => setPending(null)} onComplete={verified => setSession({ ...pending, verified })} />;
  }

  const availableNavigation = navigation.filter(item => !item.roles || item.roles.includes(session!.role));
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
  const [role, setRole] = useState<Role>("Regulator");
  const selected = roles.find(item => item.role === role)!;
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
            <Select value={role} onValueChange={value => setRole(value as Role)}>
              <SelectTrigger className="role-select" startIcon={createElement(selected.icon, { size: 20, weight: "duotone" })}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(item => <SelectItem key={item.role} value={item.role}>{item.label}</SelectItem>)}
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
  onComplete: (verified: boolean) => void;
}) {
  const [license, setLicense] = useState("");
  const [organization, setOrganization] = useState("");
  const isRegulator = applicant.role === "Regulator";
  const isManufacturer = applicant.role === "Manufacturer";
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
            <label className="field"><span>{isRegulator ? "Agency staff ID" : isManufacturer ? "NAFDAC establishment number" : "Professional registration number"}</span><input value={license} onChange={e => setLicense(e.target.value)} placeholder={isRegulator ? "e.g. NAF/HQ/10482" : isManufacturer ? "e.g. MAN-002918" : "e.g. PCN-123456"} /></label>
            <label className="field"><span>{isRegulator ? "Agency / directorate" : "Organization / facility"}</span><input value={organization} onChange={e => setOrganization(e.target.value)} placeholder={isRegulator ? "NAFDAC, Investigation & Enforcement" : "Registered organization name"} /></label>
          </div>
          <button className="upload-zone" type="button"><IdentificationCard size={28} weight="duotone" /><span><b>Upload supporting credential</b><small>License, appointment letter or premises certificate · PDF, JPG or PNG</small></span><Plus /></button>
          <div className="verification-notice"><ShieldCheck weight="duotone" /><p><b>A document alone does not prove entitlement.</b> Production verification will reconcile identity, registry status, organization control, expiry, sanctions and reviewer approval.</p></div>
          <div className="verification-actions">
            <button className="button ghost" onClick={onBack}>Back</button>
            <button className="button secondary" onClick={() => onComplete(false)}>Skip for development</button>
            <button className="button primary" onClick={() => onComplete(true)} disabled={!license || !organization}>Submit verification</button>
          </div>
          <small className="dev-note">Development bypass is visibly marked and must be disabled outside non-production environments.</small>
        </section>
      </div>
    </main>
  );
}

function Sidebar({ role, page, items, open, onNavigate, onClose }: {
  role: Role; page: PageKey; items: typeof navigation; open: boolean; onNavigate: (page: PageKey) => void; onClose: () => void;
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
            <span className="profile-copy"><b>{session.name}</b><small>{session.role}{session.verified ? " · Verified" : " · Dev access"}</small></span>
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
  page: PageKey; role: Role; search: string; notify: (message: string) => void; navigate: (page: PageKey) => void;
}) {
  if (page === "overview") return <Overview role={role} notify={notify} navigate={navigate} />;
  if (page === "alerts") return <AlertsPage search={search} notify={notify} />;
  if (page === "shipments") return <ShipmentsPage search={search} notify={notify} />;
  if (page === "inventory") return <InventoryPage search={search} notify={notify} />;
  if (page === "trace") return <TracePage search={search} />;
  if (page === "entities") return <EntitiesPage notify={notify} />;
  if (page === "compliance") return <CompliancePage notify={notify} />;
  if (page === "reports") return <ReportsPage notify={notify} />;
  if (page === "recalls") return <RecallsPage notify={notify} />;
  if (page === "audit") return <AuditPage />;
  return <VerifyPage role={role} notify={notify} />;
}

function Overview({ role, notify, navigate }: { role: Role; notify: (message: string) => void; navigate: (page: PageKey) => void }) {
  const careRole = ["Pharmacist", "Hospital", "Clinic", "Dispenser"].includes(role);
  const metrics = careRole
    ? [["Units on hand", "22,490", "+1,220 this week"], ["Verified scans", "3,842", "99.2% genuine"], ["Expiring ≤90 days", "6,470", "₦59.2M value"], ["Open exceptions", "8", "2 require action"]]
    : [["Tracked medicine units", "104,238", "+4,812 today"], ["Authenticity scans", "58,693", "88.4% genuine"], ["Active alerts", "27", "15 critical"], ["Shipments in transit", "182", "83.5% on time"]];
  return (
    <>
      <section className="metrics">{metrics.map(([label, value, detail], index) => <Metric key={label} label={label} value={value} detail={detail} index={index} />)}</section>
      <div className="overview-grid">
        <SupplyMap onRoute={route => notify(`${route} route selected`)} />
        <section className="focus-panel">
          <div className="panel-heading"><div><span className="eyebrow danger">Priority incident</span><h2>Suspected counterfeit detected</h2></div><Status value="Critical" /></div>
          <div className="incident-summary">
            <Info label="Alert ID" value="ALRT-2026-0612-007" /><Info label="Detected" value="12 Jun 2026 · 21:18 WAT" />
            <Info label="Product" value="Paracetamol 500mg" /><Info label="Location" value="Kano Municipal Market" />
            <Info label="Batch" value="PCT500-04125" /><Info label="Units affected" value="240 units" />
          </div>
          <div className="confidence"><span><b>98%</b> counterfeit confidence</span><i><em /></i></div>
          <div className="button-row"><button className="button primary" onClick={() => notify("Investigation case opened and audit logged")}>Open investigation</button><button className="button ghost" onClick={() => navigate("alerts")}>View all alerts</button></div>
        </section>
        <section className="data-panel span-2">
          <div className="panel-heading"><div><span className="eyebrow">Live operations</span><h2>Recent integrity signals</h2></div><button className="text-button" onClick={() => navigate("alerts")}>View all incidents →</button></div>
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

function InventoryPage({ search, notify }: { search: string; notify: (message: string) => void }) {
  const [status, setStatus] = useState("All");
  const filtered = inventory.filter(row => (status === "All" || row.status === status) && matches(row, search));
  return <CollectionPage stats={[["Units on hand", "22,490"], ["Available", "21,458"], ["Quarantined", "612"], ["Expiring ≤90 days", "6,470"]]}>
    <Toolbar searchLabel="Filter inventory" value={status} options={["All", "Healthy", "Expiring", "Cold chain"]} onChange={setStatus} />
    <DataTable headers={["Medicine", "Batch / lot", "On hand", "Available", "Expiry", "Condition", ""]}>
      {filtered.map(row => <tr key={row.batch}><td><b>{row.product}</b></td><td><code>{row.batch}</code></td><td>{row.onHand.toLocaleString()}</td><td>{row.available.toLocaleString()}</td><td>{row.expiry}</td><td><Status value={row.status} /></td><td><button className="table-action" onClick={() => notify(`${row.batch} stock adjustment opened`)}>Adjust</button></td></tr>)}
    </DataTable>
  </CollectionPage>;
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

function VerifyPage({ role, notify }: { role: Role; notify: (message: string) => void }) {
  const [code, setCode] = useState("61540012345678");
  const [result, setResult] = useState<"idle" | "genuine" | "suspicious">("idle");
  const verify = () => { const next = code.endsWith("9") ? "suspicious" : "genuine"; setResult(next); notify("Verification event written to the audit trail"); };
  return <div className="verify-layout"><section className="scanner-panel"><div className="scan-visual"><QrCode size={84} weight="duotone" /></div><span className="eyebrow">Serialized product check</span><h2>Scan or enter a medicine code</h2><p>Enter a GTIN, serial number or MedSafe QR payload. Every request is tied to your {role} identity.</p><label className="verify-input"><input value={code} onChange={e => setCode(e.target.value)} placeholder="GTIN or serial number" /><button onClick={verify}>Verify medicine</button></label><small>Try a code ending in 9 to preview a suspicious result.</small></section><section className={`result-panel ${result}`}><div className="result-head">{result === "idle" ? <QrCode weight="duotone" /> : result === "genuine" ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}<div><span className="eyebrow">Verification result</span><h2>{result === "idle" ? "Awaiting scan" : result === "genuine" ? "Genuine medicine" : "Suspicious medicine"}</h2><p>{result === "idle" ? "Product and custody details will appear here." : result === "genuine" ? "Identity and current custody are valid." : "Duplicate scan pattern detected. Do not dispense."}</p></div></div>{result !== "idle" && <div className="result-details"><Info label="Product" value="Paracetamol Tablets BP 500mg" /><Info label="Batch" value="PCT500-04125" /><Info label="Manufacturer" value="Novartis Pharma Nig. Ltd" /><Info label="Current custodian" value="LUTH Pharmacy, Idi-Araba" /><Info label="Expiry" value="March 2027" /><Info label="Last event" value="Received · 15 Jun 2026" /></div>}</section>{result !== "idle" && <section className="data-panel full"><div className="panel-heading"><div><span className="eyebrow">Custody evidence</span><h2>Medicine journey</h2></div></div><TraceTimeline /></section>}</div>;
}

function CommandPalette({ items, onClose, onNavigate }: { items: typeof navigation; onClose: () => void; onNavigate: (page: PageKey) => void }) {
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
