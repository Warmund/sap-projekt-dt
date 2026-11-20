// Workflow-Logik des Sanktionsregisters, unabhängig von React und Next.js.
import type { BlockedPartner, Decision, OverallStatus, StepKey, StepStatus } from "./types";

export const STEP_DEFS: Record<StepKey, { label: string; system: string; team: string; doneText: string; runningText: string; note?: string }> = {
  suser: { label: "S-User sperren", system: "W7", team: "S-User-Team", doneText: "Nach Freigabe automatisch abgeschlossen (Demo)", runningText: "" },
  ticketsShn: { label: "Offene Support-Tickets in ServiceNow schließen", system: "ServiceNow", team: "Support", doneText: "Ticketprüfung abgeschlossen und SHN aktiviert", runningText: "Offene Support-Tickets in ServiceNow schließen, danach SHN aktivieren", note: "SHN auch aktivieren, wenn keine Tickets offen sind." },
  rcsc: { label: "I7P Control Table Board", system: "RCSC", team: "Remote-Support", doneText: "I7P Control Table Board bearbeitet", runningText: "I7P Control Table Board bearbeiten" },
  scg: { label: "SCG", system: "Partner Teams", team: "Partner Teams", doneText: "SCG bestätigt", runningText: "SCG manuell bearbeiten" },
  cloud: { label: "Cloud-Sperre je LoB", system: "Ticket je Line of Business", team: "Partner Teams", doneText: "Alle Tenants gesperrt", runningText: "Tenants werden von den LoBs gesperrt" },
  notify: { label: "Benachrichtigung", system: "E-Mail", team: "Export Control", doneText: "E-Mail-Versand bestätigt", runningText: "E-Mail unter „Benachrichtigungen“ vorbereiten" },
  irdp: { label: "IRDP-Flag setzen", system: "Launchpad", team: "Partner Teams", doneText: "IRDP-Flag gesetzt", runningText: "IRDP-Flag im Launchpad setzen" },
  bcp: { label: "BCP-Ticket", system: "BCP", team: "Partner Teams", doneText: "BCP-Ticket bestätigt", runningText: "BCP-Ticket bearbeiten" },
};

export const STEP_ORDER: readonly StepKey[] = ["suser", "ticketsShn", "rcsc", "notify", "scg", "cloud"];

export const SCG_STEPS = ["irdp", "bcp"] as const;
export const MANUAL_STEPS = ["scg", "cloud"] as const;
export const PERSISTED_STEPS = STEP_ORDER.flatMap((step) => step === "scg" ? [...SCG_STEPS] : [step]);
export const AUTO_RESULT = "Nach Freigabe automatisch abgeschlossen (Demo)";

export function isManualStep(step: StepKey) {
  return MANUAL_STEPS.some((manual) => manual === step) || SCG_STEPS.some((child) => child === step);
}

export function notificationPending(p: BlockedPartner) {
  return p.decision === "approved" && !p.completed.notify;
}

export function isApplicable(p: BlockedPartner, step: StepKey) {
  return step !== "cloud" || p.cloudCustomer;
}

/** Status je Sperrschritt in Prozessreihenfolge. */
export function stepStatuses(p: BlockedPartner): Record<StepKey, StepStatus> {
  const result = {} as Record<StepKey, StepStatus>;
  let blocked = false;
  for (const step of STEP_ORDER) {
    if (!isApplicable(p, step)) { result[step] = "notApplicable"; continue; }
    if (p.decision === "pending") { result[step] = "pendingApproval"; continue; }
    if (p.decision !== "approved") { result[step] = "skipped"; continue; }
    if (step === "scg") {
      for (const child of SCG_STEPS) result[child] = p.completed[child] ? "done" : "running";
      result.scg = SCG_STEPS.every((child) => result[child] === "done") ? "done" : "running";
      blocked = result.scg !== "done";
      continue;
    }
    // Older approvals predate the automatic demo completion record.
    if (p.completed[step] || !isManualStep(step)) { result[step] = "done"; continue; }
    result[step] = blocked ? "waiting" : "running";
    blocked = true;
  }
  if (p.decision !== "approved") {
    for (const child of SCG_STEPS) result[child] = result.scg;
  }
  return result;
}

export function progress(p: BlockedPartner) {
  const statusesByStep = stepStatuses(p);
  const statuses = STEP_ORDER.map((step) => statusesByStep[step]).filter((s) => s !== "notApplicable");
  return { done: statuses.filter((s) => s === "done").length, total: statuses.length };
}

export function overallStatus(p: BlockedPartner): OverallStatus {
  if (p.decision === "pending") return "Zur Freigabe";
  if (p.decision === "sanctionedNoBlock") return "Sanktioniert ohne Sperre";
  if (p.decision === "declined") return "Abgelehnt";
  const { done, total } = progress(p);
  return done === total ? "Abgeschlossen" : "Sperrschritte laufen";
}

const DECISION_TEXT: Record<Exclude<Decision, "pending">, string> = {
  approved: "Freigegeben (Vier-Augen), Sperrschritte gestartet",
  sanctionedNoBlock: "Bestätigt als sanktioniert ohne Sperre",
  declined: "Abgelehnt, keine Sperrschritte",
};

export function decide(p: BlockedPartner, decision: Exclude<Decision, "pending">, by: string, comment: string, now = new Date()): BlockedPartner {
  if (p.decision !== "pending") return p;
  const at = now.toISOString();
  const automatic = decision === "approved";
  const completed = { ...p.completed };
  if (automatic) {
    for (const step of STEP_ORDER) {
      if (step !== "notify" && !isManualStep(step) && !completed[step]) {
        completed[step] = { at, by: "System", result: AUTO_RESULT };
      }
    }
  }
  return {
    ...p, decision, decidedBy: by, decidedAt: at, decisionComment: comment || undefined,
    completed,
    audit: [...p.audit, { at, by: `${by} (EC Member 2)`, text: DECISION_TEXT[decision] + (comment ? `: ${comment}` : "") },
      ...(automatic ? [{ at, by: "System", text: AUTO_RESULT }] : [])],
  };
}

/** Rückmeldung eines Schritts. Nur Schritte im Status „läuft“ können erledigt werden. */
export function completeStep(p: BlockedPartner, step: StepKey, by: string, result?: string, now = new Date()): BlockedPartner {
  if (step === "scg") return p;
  if (step === "notify" ? !notificationPending(p) : stepStatuses(p)[step] !== "running") return p;
  const at = now.toISOString();
  const text = result || defaultResult(p, step);
  return {
    ...p,
    completed: { ...p.completed, [step]: { at, by, result: text } },
    audit: [...p.audit, { at, by, text: `${STEP_DEFS[step].label}: ${text}` }],
  };
}

function defaultResult(p: BlockedPartner, step: StepKey) {
  if (step === "cloud") return `${p.tenants.length} von ${p.tenants.length} Tenants gesperrt`;
  return STEP_DEFS[step].doneText;
}

export function daysSince(iso: string, now = new Date()) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

/** Prüfintervall der Länder-Kontakte in Tagen (wöchentlich, mit SAP bestätigen). */
export const CONTACT_CHECK_INTERVAL_DAYS = 7;

const dateOptions = { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" } as const;
const formats = {
  de: [new Intl.DateTimeFormat("de-DE", dateOptions), new Intl.DateTimeFormat("de-DE", { ...dateOptions, hour: "2-digit", minute: "2-digit" })],
  en: [new Intl.DateTimeFormat("en-GB", dateOptions), new Intl.DateTimeFormat("en-GB", { ...dateOptions, hour: "2-digit", minute: "2-digit" })],
};
export const formatDate = (iso: string, language: "de" | "en" = "de") => formats[language][0].format(new Date(iso));
export const formatDateTime = (iso: string, language: "de" | "en" = "de") => formats[language][1].format(new Date(iso));
