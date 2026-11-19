import type { BlockedPartner, CountryContact, StepKey } from "./types";
import { CONTACT_CHECK_INTERVAL_DAYS, daysSince, stepStatuses } from "./workflow";

export const REGISTER_FILTERS = {
  all: "Alle Kunden", pending: "Zur Freigabe", open: "Offene Sperrschritte",
  approved: "Freigegebene Fälle", noBlock: "Sanktioniert ohne Sperre", sr: "Sonderkategorie SR",
  cloudMissing: "Cloud-Kunden ohne Tenant-Daten",
};
export type RegisterFilter = keyof typeof REGISTER_FILTERS;
export function matchesRegisterFilter(p: BlockedPartner, filter: RegisterFilter) {
  switch (filter) {
    case "pending": return p.decision === "pending";
    case "approved": return p.decision === "approved";
    case "noBlock": return p.decision === "sanctionedNoBlock";
    case "sr": return p.specialCategory === "SR";
    case "cloudMissing": return p.cloudCustomer && p.tenants.length === 0;
    case "open": return Object.values(stepStatuses(p)).some((s) => s === "running" || s === "waiting");
    default: return true;
  }
}
export function dashboardSummary(partners: BlockedPartner[], contacts: CountryContact[], now = new Date()) {
  const runningSteps = partners.flatMap((p) => Object.entries(stepStatuses(p))
    .filter(([, status]) => status === "running" || status === "waiting").map(([key]) => key as StepKey));
  const count = (filter: RegisterFilter) => partners.filter((p) => matchesRegisterFilter(p, filter)).length;
  const years = [...new Set(partners.map((p) => p.gtsBlockedAt.slice(0, 4)))].sort();
  return {
    total: partners.length, pending: count("pending"), approved: count("approved"), noBlock: count("noBlock"), sr: count("sr"),
    cloudMissing: count("cloudMissing"), runningSteps, years,
    dueContacts: contacts.filter((c) => !c.lastChecked || daysSince(c.lastChecked, now) >= CONTACT_CHECK_INTERVAL_DAYS).length,
  };
}
export function blockingTimeline(partners: BlockedPartner[], year: string) {
  if (year === "all") {
    const years = [...new Set(partners.map((p) => p.gtsBlockedAt.slice(0, 4)))].sort();
    return years.map((label) => ({ label, value: partners.filter((p) => p.gtsBlockedAt.startsWith(label)).length }));
  }
  return Array.from({ length: 12 }, (_, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return { label: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"][month],
      value: partners.filter((p) => p.gtsBlockedAt.startsWith(prefix)).length };
  });
}
