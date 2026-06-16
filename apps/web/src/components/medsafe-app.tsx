"use client";

import { Archive } from "@phosphor-icons/react/Archive";
import { Bell } from "@phosphor-icons/react/Bell";
import { Buildings } from "@phosphor-icons/react/Buildings";
import { CaretDown } from "@phosphor-icons/react/CaretDown";
import { CheckCircle } from "@phosphor-icons/react/CheckCircle";
import { ClipboardText } from "@phosphor-icons/react/ClipboardText";
import { Factory } from "@phosphor-icons/react/Factory";
import { FileMagnifyingGlass } from "@phosphor-icons/react/FileMagnifyingGlass";
import { FirstAid } from "@phosphor-icons/react/FirstAid";
import { Funnel } from "@phosphor-icons/react/Funnel";
import { IdentificationCard } from "@phosphor-icons/react/IdentificationCard";
import { List } from "@phosphor-icons/react/List";
import { MagnifyingGlass } from "@phosphor-icons/react/MagnifyingGlass";
import { MapTrifold } from "@phosphor-icons/react/MapTrifold";
import { Package } from "@phosphor-icons/react/Package";
import { Pulse } from "@phosphor-icons/react/Pulse";
import { QrCode } from "@phosphor-icons/react/QrCode";
import { ShieldCheck } from "@phosphor-icons/react/ShieldCheck";
import { Siren } from "@phosphor-icons/react/Siren";
import { Truck } from "@phosphor-icons/react/Truck";
import { UserCircle } from "@phosphor-icons/react/UserCircle";
import { Warning } from "@phosphor-icons/react/Warning";
import { X } from "@phosphor-icons/react/X";
import { useMemo, useState } from "react";

type Role = "Regulator" | "Manufacturer" | "Pharmacy";
type View = "command" | "verification";

const incidents = [
  ["ALT-2026-0612-007", "Critical", "Suspected counterfeit", "Paracetamol 500mg", "Kano", "Active"],
  ["ALT-2026-0612-006", "High", "Diversion risk", "Tramadol 100mg", "Onitsha", "Under review"],
  ["ALT-2026-0612-005", "High", "Unregistered product", "Artemether 20mg", "Aba", "Active"],
  ["ALT-2026-0612-004", "Medium", "Cold chain deviation", "Insulin 100IU/ml", "Enugu", "Investigating"],
];

const ledger = [
  ["12 Jun 2026 08:15", "MANUFACTURED", "Novartis Pharma AG, Basel", "1,000", "f7c3a0e8b9d2c1e3", "Confirmed"],
  ["12 Jun 2026 11:23", "EXPORTED", "Novartis Export FZE, Dubai", "1,000", "3b1d9f2a7c4d88f1", "Confirmed"],
  ["13 Jun 2026 03:40", "IMPORTED", "Novartis Pharma Nig. Ltd", "1,000", "aa98c6d7e12b4f3c", "Confirmed"],
  ["14 Jun 2026 10:11", "DISTRIBUTED", "Swift Medicals Ltd, Surulere", "1,000", "91d6e0b3c7a941d0", "Confirmed"],
  ["15 Jun 2026 09:15", "RECEIVED", "LUTH Pharmacy, Idi-Araba", "200", "c8e4f55a2b6e1a9d", "Confirmed"],
];

const roleCopy = {
  Regulator: { title: "National Command Grid", subtitle: "Real-time visibility of medicine integrity, shipments, and compliance across Nigeria." },
  Manufacturer: { title: "Manufacturing Command Grid", subtitle: "Monitor registered batches, downstream custody, recalls, and partner compliance." },
  Pharmacy: { title: "Verification Workspace", subtitle: "Verify medicines, receive shipments, manage inventory, and resolve dispensing exceptions." },
};

export function MedSafeApp() {
  const [role, setRole] = useState<Role>("Regulator");
  const [view, setView] = useState<View>("command");
  const [roleOpen, setRoleOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const data = useMemo(() => roleCopy[role], [role]);

  const chooseRole = (next: Role) => {
    setRole(next);
    setView(next === "Pharmacy" ? "verification" : "command");
    setRoleOpen(false);
  };

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><ShieldCheck weight="fill" /><div><strong>MedSafe<span>+</span></strong><small>Trusted medicine network</small></div></div>
        <nav>
          <Nav active={view === "command"} icon={<MapTrifold />} label={role === "Pharmacy" ? "Workspace" : "Command Grid"} onClick={() => setView("command")} />
          {role !== "Pharmacy" && <Nav icon={<Siren />} label="Alerts & Incidents" count="15" />}
          <Nav icon={<Truck />} label="Shipments" />
          <Nav icon={<Archive />} label="Inventory" />
          <Nav icon={<Pulse />} label="Trace Ledger" />
          {role === "Regulator" && <Nav icon={<IdentificationCard />} label="Licenses & Entities" onClick={() => setReviewOpen(true)} />}
          <Nav icon={<ShieldCheck />} label="Compliance" />
          <Nav icon={<ClipboardText />} label="Reports & Analytics" />
          {role !== "Pharmacy" && <Nav icon={<Package />} label="Recall Management" />}
          <Nav icon={<FileMagnifyingGlass />} label="Audit Trail" />
        </nav>
        <div className="sidebar-bottom">
          <button className="system-ok"><i /> All systems operational</button>
          <small>Data refresh: 30s ago<br />12 June 2026, 22:42 WAT</small>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="icon-button"><List /></button>
          <label className="search"><MagnifyingGlass /><input placeholder="Search batch, product, GTIN, location, licensee..." /><kbd>⌘ K</kbd></label>
          <div className="top-actions">
            <div className="role-switcher">
              <button onClick={() => setRoleOpen(!roleOpen)}>Switch role: <b>{role}</b><CaretDown /></button>
              {roleOpen && <div className="role-menu">
                {(["Regulator", "Manufacturer", "Pharmacy"] as Role[]).map(item => <button key={item} onClick={() => chooseRole(item)}>{item === "Regulator" ? <ShieldCheck /> : item === "Manufacturer" ? <Factory /> : <FirstAid />}{item}</button>)}
              </div>}
            </div>
            <button className="scan-button" onClick={() => setView("verification")}><QrCode /> Scan / Verify</button>
            <button className="icon-button notification"><Bell /><span>7</span></button>
            <button className="profile"><UserCircle weight="fill" /><span>Adegoke I.<small>{role === "Regulator" ? "NAFDAC HQ" : role}</small></span><CaretDown /></button>
          </div>
        </header>

        <div className="page">
          {view === "verification" ? (
            <VerificationWorkspace role={role} onBack={() => setView("command")} />
          ) : (
            <>
              <div className="page-heading">
                <div><h1>{data.title}</h1><p>{data.subtitle}</p></div>
                <div className="filters"><button>12 Jun 2026, 00:00 – now</button><button><Funnel /> Filters <CaretDown /></button></div>
              </div>
              <Metrics role={role} />
              <div className="command-grid">
                <section className="map-panel">
                  <img src="/nigeria-supply-map.png" alt="Nigeria supply-chain risk and shipment map" />
                  <div className="map-controls"><button>+</button><button>−</button><button>◎</button></div>
                  <div className="map-legend"><b>MAP LEGEND</b><span><i className="green-line" /> On-time</span><span><i className="amber-line" /> Delayed</span><span><i className="red-line" /> High risk route</span></div>
                </section>
                <IncidentInspector />
                <section className="incidents panel">
                  <div className="section-title"><b>ACTIVE INCIDENTS & ALERTS <em>(27)</em></b><button>View all alerts</button></div>
                  <table><thead><tr><th>ID</th><th>Severity</th><th>Type</th><th>Product</th><th>Location</th><th>Status</th></tr></thead>
                    <tbody>{incidents.map(row => <tr key={row[0]}>{row.map((cell, index) => <td key={cell}>{index === 1 ? <Status value={cell} /> : cell}</td>)}</tr>)}</tbody>
                  </table>
                </section>
                <aside className="side-list panel">
                  <div className="section-title"><b>ACTIVE SHIPMENTS (182)</b><button>View all</button></div>
                  {["Lagos → Kano", "Port Harcourt → Abuja", "Apapa → Enugu", "Lagos → Maiduguri"].map((route, i) => <div className="shipment" key={route}><span>TRK-2026-0{958-i}</span><b>{route}</b><em className={i % 2 ? "delayed" : ""}>{i % 2 ? "Delayed" : "On-time"}</em></div>)}
                </aside>
                <TraceLedger />
                <aside className="expiry panel">
                  <div className="section-title"><b>EXPIRING STOCK (≤ 90 DAYS)</b></div>
                  {["Amoxicillin 500mg Caps", "Diclofenac 75mg Inj.", "Metronidazole 400mg Tabs"].map((item, i) => <div key={item}><span>{item}</span><b>{[4320,2150,1980][i].toLocaleString()}</b><em>{[28.6,19.4,11.2][i]}M NGN</em></div>)}
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      {reviewOpen && <VerificationReview verified={verified} onClose={() => setReviewOpen(false)} onApprove={() => setVerified(true)} />}
    </main>
  );
}

function Nav({ icon, label, active, count, onClick }: { icon: React.ReactNode; label: string; active?: boolean; count?: string; onClick?: () => void }) {
  return <button className={active ? "nav-active" : ""} onClick={onClick}>{icon}<span>{label}</span>{count && <em>{count}</em>}</button>;
}

function Metrics({ role }: { role: Role }) {
  const metrics = role === "Manufacturer"
    ? [["REGISTERED UNITS", "104,238", "+4.83%"], ["ACTIVE BATCHES", "86", "4 released today"], ["DOWNSTREAM SCANS", "58,693", "88.4% genuine"], ["OPEN EXCEPTIONS", "12", "3 critical"], ["SHIPMENTS IN TRANSIT", "42", "35 on-time"], ["PARTNER COMPLIANCE", "91.7%", "+2.1pp"]]
    : [["TRACKED MEDICINE UNITS", "104,238", "+4,812 today"], ["AUTHENTICITY SCANS (24H)", "58,693", "88.4% genuine"], ["ACTIVE ALERTS", "27", "15 critical"], ["SHIPMENTS IN TRANSIT", "182", "83.5% on-time"], ["EXPIRING STOCK (90 DAYS)", "12,854", "₦1.24B value"], ["NATIONAL COMPLIANCE", "78.4%", "+3.6pp"]];
  return <section className="metrics">{metrics.map(([label, value, detail]) => <div key={label}><small>{label}</small><strong>{value}</strong><span>{detail}</span></div>)}</section>;
}

function Status({ value }: { value: string }) {
  return <span className={`status ${value.toLowerCase()}`}>{value}</span>;
}

function IncidentInspector() {
  return <aside className="inspector panel">
    <div className="critical-label">CRITICAL ALERT <span>1 of 15</span></div>
    <h2>Suspected Counterfeit Detected</h2>
    <dl><dt>Alert ID</dt><dd>ALRT-2026-0612-007</dd><dt>Severity</dt><dd><Status value="Critical" /></dd><dt>Status</dt><dd className="red-dot">Active</dd><dt>Detected</dt><dd>12 Jun 2026 21:18 WAT</dd><dt>Location</dt><dd>Kano Municipal Market</dd></dl>
    <hr /><h3>PRODUCT & BATCH</h3>
    <dl><dt>Product</dt><dd>Paracetamol Tablets BP 500mg</dd><dt>Brand</dt><dd>Medicare</dd><dt>Batch / Lot</dt><dd>PCT500-04125</dd><dt>GTIN</dt><dd>61540012345678</dd><dt>Expiry</dt><dd>Mar 2027</dd></dl>
    <hr /><h3>ALERT SUMMARY</h3>
    <dl><dt>Detection type</dt><dd>Authentication scan</dd><dt>Scan result</dt><dd><Status value="Counterfeit" /></dd><dt>Confidence</dt><dd>98%</dd><dt>Units affected</dt><dd>240 units</dd></dl>
    <button className="primary">Initiate Investigation</button><div className="split-buttons"><button>Hold batch</button><button>Notify stakeholders</button></div>
  </aside>;
}

function TraceLedger() {
  return <section className="ledger panel">
    <div className="section-title"><b>TRACE LEDGER <em>(Chain-of-Custody)</em></b><button>Export ledger</button></div>
    <div className="custody">
      {[["Factory","Manufactured"],["Package","Imported"],["Buildings","Distributed"],["FirstAid","Received"]].map(([_, label], i) => <div key={label}><span>{i+1}</span><b>{label}</b><small>{["Basel, Switzerland","Apapa, Lagos","Surulere, Lagos","Idi-Araba, Lagos"][i]}</small>{i < 3 && <i>→</i>}</div>)}
    </div>
    <table><thead><tr><th>Event time (WAT)</th><th>Event type</th><th>Partner / Location</th><th>Qty</th><th>Event hash (SHA-256)</th><th>Status</th></tr></thead>
      <tbody>{ledger.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={cell} className={i === 1 ? "event-type" : ""}>{i === 4 ? <code>{cell}…</code> : i === 5 ? <span className="confirmed"><CheckCircle /> {cell}</span> : cell}</td>)}</tr>)}</tbody>
    </table>
  </section>;
}

function VerificationWorkspace({ role, onBack }: { role: Role; onBack: () => void }) {
  const [code, setCode] = useState("61540012345678");
  const [result, setResult] = useState<"idle"|"genuine"|"suspicious">("genuine");
  return <div className="verification-page">
    <div className="page-heading"><div><button className="back" onClick={onBack}>← Back to command grid</button><h1>Medicine Verification</h1><p>Scan a unit QR code or enter its GTIN/serial to verify identity and custody.</p></div></div>
    <div className="verify-grid">
      <section className="scan-zone panel"><QrCode /><h2>Scan medicine code</h2><p>Use a camera scanner or enter the serialized code manually.</p><label><input value={code} onChange={e => setCode(e.target.value)} /><button onClick={() => setResult(code.endsWith("9") ? "suspicious" : "genuine")}>Verify</button></label><small>Connected as {role} · Every verification is audit logged</small></section>
      <section className={`verification-result panel ${result}`}>
        {result === "genuine" ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}
        <div><small>VERIFICATION RESULT</small><h2>{result === "genuine" ? "GENUINE" : "SUSPICIOUS"}</h2><p>{result === "genuine" ? "Identity and current custody are valid." : "Duplicate scan pattern detected. Do not dispense."}</p></div>
        <dl><dt>Product</dt><dd>Paracetamol Tablets BP 500mg</dd><dt>Batch</dt><dd>PCT500-04125</dd><dt>Manufacturer</dt><dd>Novartis Pharma Nig. Ltd</dd><dt>Current custodian</dt><dd>LUTH Pharmacy, Idi-Araba</dd><dt>Expiry</dt><dd>March 2027</dd></dl>
      </section>
      <TraceLedger />
    </div>
  </div>;
}

function VerificationReview({ verified, onClose, onApprove }: { verified: boolean; onClose: () => void; onApprove: () => void }) {
  return <div className="modal-backdrop">
    <section className="review-modal">
      <header><div><small>IDENTITY ASSURANCE CASE</small><h2>Pharmacist role verification</h2><p>CASE-2026-00481 · Submitted 11 Jun 2026</p></div><button onClick={onClose}><X /></button></header>
      <div className="assurance-banner"><ShieldCheck weight="fill" /><div><b>{verified ? "Verified entitlement" : "Restricted pending review"}</b><span>{verified ? "The role is active until the license expiry date." : "The applicant cannot transact, dispense, or approve custody transfers."}</span></div></div>
      <div className="review-body">
        <div className="applicant"><UserCircle weight="fill" /><div><h3>Dr. Amara Okafor</h3><p>Claimed role: Superintendent Pharmacist</p><span>GreenCross Pharmacy Ltd · Lagos</span></div></div>
        <h3>Assurance checks</h3>
        <div className="checks">
          <Check label="Identity & liveness" detail="NIN matched; selfie liveness passed" state="passed" />
          <Check label="Professional license" detail="PCN registration number matched; active through Dec 2026" state="passed" />
          <Check label="Organization & premises" detail="CAC entity matched; premises license under manual review" state="review" />
          <Check label="Evidence integrity" detail="Certificate image OCR matches supplied registration data" state="passed" />
          <Check label="MFA enrollment" detail="Authenticator app and recovery codes configured" state="passed" />
        </div>
        <div className="evidence"><h3>Submitted evidence</h3><button><IdentificationCard /> PCN annual license.pdf <span>SHA-256 recorded</span></button><button><Buildings /> Premises certificate.jpg <span>Virus scanned</span></button></div>
        <aside className="verification-note"><b>Verification policy</b><p>Documents support the claim but do not prove it alone. MedSafe reconciles identity, regulator registry status, organization control, premises licensing, expiry, sanctions, and reviewer approval.</p></aside>
      </div>
      <footer><button onClick={onClose}>Request more information</button><button className="danger">Reject claim</button><button className="primary" onClick={onApprove} disabled={verified}>{verified ? "Role verified" : "Approve verified role"}</button></footer>
    </section>
  </div>;
}

function Check({ label, detail, state }: { label: string; detail: string; state: "passed"|"review" }) {
  return <div><span className={state}>{state === "passed" ? <CheckCircle weight="fill" /> : <Warning weight="fill" />}</span><b>{label}</b><p>{detail}</p><em>{state === "passed" ? "Passed" : "Review"}</em></div>;
}
