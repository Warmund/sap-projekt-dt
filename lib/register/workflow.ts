// Workflow-Logik des Sanktionsregisters, unabhängig von React und Next.js.
import type { BlockedPartner, Decision, OverallStatus, StepKey, StepOrderVariant, StepStatus } from "./types";

export const STEP_DEFS: Record<StepKey, { label: string; system: string; team: string; doneText: string; runningText: string; note?: string }> = {
  suser: { label: "S-User sperren", system: "W7", team: "S-User-Team", doneText: "S-User gesperrt", runningText: "Sperre in W7 läuft" },
  tickets: { label: "Offene Support-Tickets schließen", system: "ServiceNow, BCP", team: "Support", doneText: "Tickets geschlossen", runningText: "Schließung läuft, alternativ Rückmeldung „keine Tickets“" },
  remote: { label: "Remote-Verbindung sperren", system: "RCSC und Secure Support", team: "Remote-Support", doneText: "Remote-Zugang gesperrt", runningText: "Sperre läuft", note: "Startet erst, wenn alle Tickets geschlossen sind" },
  cloud: { label: "Cloud-Sperre je LoB", system: "Ticket je Line of Business", team: "Cloud-LoB", doneText: "Alle Tenants gesperrt", runningText: "Tenants werden von den LoBs gesperrt" },
  notify: { label: "Benachrichtigung", system: "E-Mail an AE und Landesverantwortliche", team: "Export Control", doneText: "Account Executive und Landesverantwortliche informiert", runningText: "E-Mail-Entwurf bereit" },
};

export const PHASES: Record<StepOrderVariant, StepKey[][]> = {
  A: [["suser"], ["tickets"], ["remote"], ["cloud"], ["notify"]],
  B: [["tickets"], ["remote"], ["suser", "cloud"], ["notify"]],
};

export const VARIANT_LABEL: Record<StepOrderVariant, string> = {
  A: "Variante A laut SAP-Folien: S-User zuerst, dann Tickets, Remote, Cloud",
  B: "Variante B laut Call 06.11.: Tickets, dann Remote, dann S-User und Cloud parallel",
};

export function isApplicable(p: BlockedPartner, step: StepKey) {
  return step !== "cloud" || p.cloudCustomer;
}

/** Status je Sperrschritt für die gewählte Reihenfolge. */
export function stepStatuses(p: BlockedPartner, variant: StepOrderVariant): Record<StepKey, StepStatus> {
  const result = {} as Record<StepKey, StepStatus>;
  let blocked = false;
  for (const phase of PHASES[variant]) {
    let phaseOpen = false;
    for (const step of phase) {
      if (!isApplicable(p, step)) { result[step] = "notApplicable"; continue; }
      if (p.decision === "pending") { result[step] = "pendingApproval"; continue; }
      if (p.decision !== "approved") { result[step] = "skipped"; continue; }
      if (p.completed[step]) { result[step] = "done"; continue; }
      result[step] = blocked ? "waiting" : "running";
      phaseOpen = true;
    }
    if (phaseOpen) blocked = true;
  }
  return result;
}

export function progress(p: BlockedPartner, variant: StepOrderVariant) {
  const statuses = Object.values(stepStatuses(p, variant)).filter((s) => s !== "notApplicable");
  return { done: statuses.filter((s) => s === "done").length, total: statuses.length };
}

export function overallStatus(p: BlockedPartner, variant: StepOrderVariant): OverallStatus {
  if (p.decision === "pending") return "Zur Freigabe";
  if (p.decision === "sanctionedNoBlock") return "Sanktioniert ohne Sperre";
  if (p.decision === "declined") return "Abgelehnt";
  const { done, total } = progress(p, variant);
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
  return {
    ...p, decision, decidedBy: by, decidedAt: at, decisionComment: comment || undefined,
    audit: [...p.audit, { at, by: `${by} (EC Member 2)`, text: DECISION_TEXT[decision] + (comment ? `: ${comment}` : "") }],
  };
}

/** Rückmeldung eines Schritts. Nur Schritte im Status „läuft“ können erledigt werden. */
export function completeStep(p: BlockedPartner, step: StepKey, variant: StepOrderVariant, by: string, result?: string, now = new Date()): BlockedPartner {
  if (stepStatuses(p, variant)[step] !== "running") return p;
  const at = now.toISOString();
  const text = result || defaultResult(p, step);
  return {
    ...p,
    completed: { ...p.completed, [step]: { at, by, result: text } },
    audit: [...p.audit, { at, by, text: `${STEP_DEFS[step].label}: ${text}` }],
  };
}

/** Demo-Hilfe: alle laufenden Schritte zurückmelden. */
export function advance(p: BlockedPartner, variant: StepOrderVariant, now = new Date()): BlockedPartner {
  const statuses = stepStatuses(p, variant);
  return (Object.keys(statuses) as StepKey[])
    .filter((s) => statuses[s] === "running")
    .reduce((acc, s) => completeStep(acc, s, variant, `Rückmeldung ${STEP_DEFS[s].system}`, undefined, now), p);
}

function defaultResult(p: BlockedPartner, step: StepKey) {
  switch (step) {
    case "suser": return "12 S-User gesperrt";
    case "tickets": return "2 Tickets geschlossen";
    case "remote": return "Remote-Zugang gesperrt";
    case "cloud": return `${p.tenants.length} von ${p.tenants.length} Tenants gesperrt`;
    case "notify": return STEP_DEFS.notify.doneText;
  }
}

export function daysSince(iso: string, now = new Date()) {
  return Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000);
}

/** Prüfintervall der Länder-Kontakte in Tagen (wöchentlich, mit SAP bestätigen). */
export const CONTACT_CHECK_INTERVAL_DAYS = 7;

const dateFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });
const dateTimeFmt = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
export const formatDate = (iso: string) => dateFmt.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso));
