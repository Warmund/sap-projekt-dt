// Synthetische Mock-Daten. Alle Namen, IDs und Personen sind frei erfunden.
import type { BlockedPartner, CountryContact, Decision, EtsCategory, SpecialCategory, StepKey, Tenant } from "./types";

type Seed = {
  id: string; name: string; country: string; ets: EtsCategory; list: string; gts: string;
  decision: Decision; done?: StepKey[]; tenants?: Tenant[]; special?: SpecialCategory; comment?: string; decisionComment?: string;
};

const EC1 = ["A. Becker", "S. Wolf"];
const EC2 = "M. Klein";

const RESULTS: Record<StepKey, string> = {
  suser: "S-User gesperrt",
  tickets: "Tickets geschlossen",
  remote: "Remote-Zugang gesperrt",
  cloud: "Alle Tenants gesperrt",
  notify: "AE und Landesverantwortliche informiert",
};

const ISO: Record<string, string> = { China: "CN", Russland: "RU", Kasachstan: "KZ", Belarus: "BY", VAE: "AE", Iran: "IR", Syrien: "SY", "Türkei": "TR", "Österreich": "AT" };

function addMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

function build(s: Seed, index: number): BlockedPartner {
  const enteredBy = EC1[index % EC1.length];
  const bpId = String(1000500 - index * 7);
  const decidedAt = s.decision === "pending" ? undefined : addMinutes(s.gts, 70);
  const completed: BlockedPartner["completed"] = {};
  const audit: BlockedPartner["audit"] = [
    { at: s.gts, by: `${enteredBy} (EC Member 1)`, text: "In SAP GTS gesperrt" },
    { at: addMinutes(s.gts, 1), by: "System", text: "Datensatz im Register angelegt" },
  ];
  if (decidedAt) {
    const text = { approved: "Freigegeben (Vier-Augen), Sperrschritte gestartet", sanctionedNoBlock: "Bestätigt als sanktioniert ohne Sperre", declined: "Abgelehnt, keine Sperrschritte" }[s.decision as Exclude<Decision, "pending">];
    audit.push({ at: decidedAt, by: `${EC2} (EC Member 2)`, text: text + (s.decisionComment ? `: ${s.decisionComment}` : "") });
  }
  (s.done ?? []).forEach((step, i) => {
    const at = addMinutes(s.gts, 120 + i * 90);
    completed[step] = { at, by: `Rückmeldung ${step === "cloud" ? "Cloud-LoB" : step === "notify" ? "Export Control" : "Team"}`, result: RESULTS[step] };
    audit.push({ at, by: completed[step]!.by, text: RESULTS[step] });
  });
  return {
    id: s.id, bpId, erpId: `${4000 + index * 13}-${ISO[s.country] ?? "XX"}`,
    name: s.name, country: s.country, ets: s.ets, sanctionsList: s.list, gtsBlockedAt: s.gts,
    enteredBy, decision: s.decision, decidedAt, decidedBy: decidedAt ? EC2 : undefined, decisionComment: s.decisionComment,
    cloudCustomer: !!s.tenants?.length, tenants: s.tenants ?? [], specialCategory: s.special ?? null,
    comment: s.comment ?? "Treffer bei Listenprüfung nach neuer Listenversion, Abgleich erfolgt.",
    completed, audit,
  };
}

const ALL: StepKey[] = ["suser", "tickets", "remote", "cloud", "notify"];

const SEEDS: Seed[] = [
  { id: "muster-trading", name: "Muster Trading Co., Ltd.", country: "China", ets: "ETS4", list: "US-SDN-Liste", gts: "2026-11-05T07:52:00Z", decision: "pending",
    tenants: [
      { lob: "SuccessFactors", product: "Employee Central", tenantId: "TEN-7781", ticket: "CLD-30112" },
      { lob: "SuccessFactors", product: "Learning", tenantId: "TEN-7782", ticket: "CLD-30112" },
      { lob: "Cloud ERP", product: "S/4HANA Cloud", tenantId: "TEN-8120", ticket: "CLD-30115" },
    ] },
  { id: "nordwind-logistik", name: "Nordwind Logistik OOO", country: "Russland", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-11-10T09:15:00Z", decision: "pending",
    tenants: [{ lob: "Ariba", product: "Ariba Network", tenantId: "TEN-9011", ticket: "CLD-30140" }] },
  { id: "kaspi-handel", name: "Kaspi Handel LLP", country: "Kasachstan", ets: "ETS4", list: "EU-Sanktionsliste", gts: "2026-11-11T13:40:00Z", decision: "pending" },
  { id: "beispiel-handels", name: "Beispiel Handels OOO", country: "Russland", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-11-03T08:10:00Z", decision: "approved", done: ["suser", "tickets"],
    tenants: [{ lob: "SuccessFactors", product: "Employee Central", tenantId: "TEN-6620", ticket: "CLD-30098" }] },
  { id: "testfirma-alpha", name: "Testfirma Alpha JSC", country: "Belarus", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-10-29T10:05:00Z", decision: "approved", done: ["suser"] },
  { id: "nordlicht-shipping", name: "Nordlicht Shipping Ltd.", country: "VAE", ets: "ETS4", list: "EU-Sanktionsliste", gts: "2026-10-27T12:30:00Z", decision: "approved", done: ["suser", "tickets", "remote"], special: "SR",
    tenants: [
      { lob: "SuccessFactors", product: "Employee Central", tenantId: "TEN-6904", ticket: "CLD-30087" },
      { lob: "SuccessFactors", product: "Learning", tenantId: "TEN-6905", ticket: "CLD-30087" },
    ] },
  { id: "demo-industrie", name: "Demo Industrie Co.", country: "Iran", ets: "ETS1", list: "Embargoland", gts: "2026-10-22T08:00:00Z", decision: "approved", done: ALL },
  { id: "probe-energy", name: "Probe Energy LLC", country: "Syrien", ets: "ETR1", list: "Embargoland", gts: "2026-10-09T07:30:00Z", decision: "approved", done: ALL },
  { id: "fiktiv-systems", name: "Fiktiv Systems Ltd.", country: "Russland", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-10-02T11:20:00Z", decision: "approved", done: ALL,
    tenants: [{ lob: "Cloud ERP", product: "S/4HANA Cloud", tenantId: "TEN-5530", ticket: "CLD-29911" }] },
  { id: "platzhalter-tech", name: "Platzhalter Tech Co.", country: "China", ets: "ETS3", list: "Untersuchung", gts: "2026-09-26T09:45:00Z", decision: "approved", done: ALL, special: "SR" },
  { id: "minsk-digital", name: "Minsk Digital LLC", country: "Belarus", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-08-19T08:30:00Z", decision: "approved", done: ALL },
  { id: "steppe-mining", name: "Steppe Mining JSC", country: "Kasachstan", ets: "ETS4", list: "US-SDN-Liste", gts: "2026-08-04T10:10:00Z", decision: "approved", done: ALL },
  { id: "ostwind-trade", name: "Ostwind Trade OOO", country: "Russland", ets: "ETS6", list: "Länderentscheidung SAP", gts: "2026-07-14T07:55:00Z", decision: "approved", done: ALL,
    tenants: [{ lob: "Concur", product: "Concur Expense", tenantId: "TEN-4410", ticket: "CLD-29120" }] },
  { id: "persis-tools", name: "Persis Tools Co.", country: "Iran", ets: "ETS1", list: "Embargoland", gts: "2026-06-23T12:00:00Z", decision: "approved", done: ALL },
  { id: "probe-payments", name: "Probe Payments LLC", country: "VAE", ets: "ETS5", list: "US-Sanktionsprogramm", gts: "2026-10-15T09:00:00Z", decision: "sanctionedNoBlock",
    decisionComment: "Nur Zahlungsbeschränkungen, Geschäft unter Auflagen möglich" },
  { id: "muster-agrar", name: "Muster Agrar OOO", country: "Kasachstan", ets: "ETS5", list: "EU-Sanktionsliste", gts: "2026-09-30T08:20:00Z", decision: "sanctionedNoBlock",
    decisionComment: "Handelsbeschränkung betrifft keine SAP-Produkte" },
  { id: "beispiel-finance", name: "Beispiel Finance Ltd.", country: "Türkei", ets: "ETS5", list: "UK-HMT-Liste", gts: "2026-09-12T13:10:00Z", decision: "sanctionedNoBlock",
    decisionComment: "Nur Zahlungsbeschränkungen" },
  { id: "alpha-consult", name: "Alpha Consult GmbH", country: "Österreich", ets: "ETS2", list: "EU-Sanktionsliste", gts: "2026-10-20T10:00:00Z", decision: "declined",
    decisionComment: "Fehlalarm, Namensgleichheit mit gelistetem Unternehmen" },
];

export const MOCK_PARTNERS: BlockedPartner[] = SEEDS.map(build);

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

/** Prüfdatum relativ zu heute, damit die Demo nicht veraltet. */
export function mockContacts(): CountryContact[] {
  return [
    { id: "cn", region: "China", countries: ["China"], generalDirector: "L. Wang", legalHead: "Y. Chen", commercialDirector: "H. Zhou", lastChecked: daysAgo(3) },
    { id: "iberia", region: "Iberia", countries: ["Spanien", "Portugal"], generalDirector: "C. Ortega", legalHead: "J. Alves", commercialDirector: "M. Ruiz", lastChecked: daysAgo(15) },
    { id: "me", region: "Middle East", countries: ["VAE", "Saudi-Arabien", "Katar"], generalDirector: "R. Haddad", legalHead: "N. Farouk", commercialDirector: "", lastChecked: daysAgo(2) },
    { id: "tr", region: "Türkei", countries: ["Türkei"], generalDirector: "E. Kaya", legalHead: "S. Demir", commercialDirector: "B. Aydın", lastChecked: daysAgo(10) },
    { id: "ca", region: "Zentralasien", countries: ["Kasachstan", "Usbekistan"], generalDirector: "D. Abenov", legalHead: "", commercialDirector: "", lastChecked: daysAgo(6) },
    { id: "cee", region: "CEE", countries: ["Russland", "Belarus", "Österreich"], generalDirector: "P. Novak", legalHead: "K. Horvath", commercialDirector: "T. Berger", lastChecked: daysAgo(1) },
    { id: "mena", region: "MENA Embargo", countries: ["Iran", "Syrien"], generalDirector: "F. Nasser", legalHead: "O. Saleh", commercialDirector: "", lastChecked: daysAgo(4) },
  ];
}

export const SANCTIONS_LISTS = ["US-SDN-Liste", "EU-Sanktionsliste", "UK-HMT-Liste", "UN-Sanktionsliste", "US-Sanktionsprogramm", "Länderentscheidung SAP", "Embargoland", "Untersuchung"];

export const ETS_INFO: Record<EtsCategory, string> = {
  ETS1: "Land oder Region nicht erlaubt",
  ETR1: "Region nicht erlaubt",
  ETS2: "Vorübergehend in Prüfung",
  ETS3: "Untersuchung läuft",
  ETS4: "Auf Sanktionsliste",
  ETS5: "Handelsbeschränkungen, Freigabe unter Auflagen",
  ETS6: "Kritisches Land, z. B. Russland",
};

/** Beispieldatensatz für die simulierte Übernahme aus GTS. */
export const GTS_SAMPLE = {
  name: "Seidenstraße Components Co., Ltd.", country: "China", ets: "ETS4" as EtsCategory, list: "US-SDN-Liste", erpId: "4912-CN", bpId: "1000611",
  tenants: [
    { lob: "SuccessFactors", product: "Employee Central", tenantId: "TEN-9921", ticket: "noch nicht angelegt" },
    { lob: "Cloud ERP", product: "S/4HANA Cloud", tenantId: "TEN-9930", ticket: "noch nicht angelegt" },
  ],
};
