import type { BlockedPartner, CountryContact } from "./types";
import { CONTACT_CHECK_INTERVAL_DAYS, daysSince, stepStatuses, STEP_ORDER } from "./workflow";

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
  const runningSteps = partners.flatMap((p) => {
    const statuses = stepStatuses(p);
    return STEP_ORDER.filter((step) => statuses[step] === "running" || statuses[step] === "waiting");
  });
  const count = (filter: RegisterFilter) => partners.filter((p) => matchesRegisterFilter(p, filter)).length;
  const years = [...new Set(partners.map((p) => p.gtsBlockedAt.slice(0, 4)))].sort();
  return {
    total: partners.length, pending: count("pending"), approved: count("approved"), noBlock: count("noBlock"), sr: count("sr"),
    cloudMissing: count("cloudMissing"), runningSteps, years,
    dueContacts: contacts.filter((c) => !c.lastChecked || daysSince(c.lastChecked, now) >= CONTACT_CHECK_INTERVAL_DAYS).length,
  };
}
export function blockingTimeline(partners: BlockedPartner[], year: string, language = "de") {
  if (year === "all") {
    const years = [...new Set(partners.map((p) => p.gtsBlockedAt.slice(0, 4)))].sort();
    return years.map((label) => ({ label, value: partners.filter((p) => p.gtsBlockedAt.startsWith(label)).length }));
  }
  const monthLabel = new Intl.DateTimeFormat(language, { month: "short", timeZone: "UTC" });
  return Array.from({ length: 12 }, (_, month) => {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return { label: monthLabel.format(new Date(Date.UTC(2000, month))),
      value: partners.filter((p) => p.gtsBlockedAt.startsWith(prefix)).length };
  });
}
