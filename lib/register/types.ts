// Fachliche Typen des Sanktionsregisters.

/** Sperrschritte nach der Vier-Augen-Freigabe. */
export type StepKey = "suser" | "ticketsShn" | "rcsc" | "notify" | "irdp" | "bcp" | "cloud";

export type StepStatus = "done" | "running" | "waiting" | "pendingApproval" | "skipped" | "notApplicable";

/** Ergebnis der Vier-Augen-Prüfung durch EC Member 2. */
export type Decision = "pending" | "approved" | "sanctionedNoBlock" | "declined";

export type EtsCategory = "ETS1" | "ETR1" | "ETS2" | "ETS3" | "ETS4" | "ETS5" | "ETS6";

export type SpecialCategory = "SR" | "Sonstige";

export type Tenant = { lob: string; product: string; tenantId: string; ticket: string };

export type AuditEntry = { at: string; text: string; by: string };

export type BlockedPartner = {
  id: string;
  bpId: string;
  erpId: string;
  name: string;
  country: string;
  region?: string;
  spl?: boolean | null;
  ruItConsultancyBan?: boolean | null;
  ukraineCrisis?: boolean | null;
  version?: number;
  ets: EtsCategory;
  sanctionsList: string;
  listReference?: string;
  /** Zeitpunkt der Sperre in SAP GTS (ISO). */
  gtsBlockedAt: string;
  gtsDateOnly?: boolean;
  /** EC Member 1, sperrt in GTS. */
  enteredBy: string;
  /** EC Member 2, entscheidet im Register. */
  decidedBy?: string;
  decidedAt?: string;
  decision: Decision;
  decisionComment?: string;
  cloudCustomer: boolean;
  tenants: Tenant[];
  specialCategory: SpecialCategory | null;
  specialComment?: string;
  comment: string;
  /** Erledigte Sperrschritte mit Rückmeldung. */
  completed: Partial<Record<StepKey, { at: string; by: string; result: string }>>;
  audit: AuditEntry[];
};

export type CountryContact = {
  id: string;
  region: string;
  countries: string[];
  generalDirector: string;
  legalHead: string;
  commercialDirector: string;
  /** Zuletzt geprüft (ISO). */
  lastChecked: string | null;
};

export type OverallStatus = "Zur Freigabe" | "Sperrschritte laufen" | "Abgeschlossen" | "Sanktioniert ohne Sperre" | "Abgelehnt";
