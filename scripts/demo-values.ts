// Beispielwerte für die Demo: füllt importierte Kunden und Länder-Kontakte mit erfundenen, klar markierten Werten.
// Aufruf: npm run demo:values            (schreiben)
//         npm run demo:values -- --dry-run  (nur anzeigen)
//         npm run demo:values -- --undo     (alle Beispielwerte wieder entfernen)
import "dotenv/config";
import { db } from "../lib/db";
import { completeStep, decide, stepStatuses } from "../lib/register/workflow";
import type { BlockedPartner, Decision, StepKey } from "../lib/register/types";

/** Kennzeichnung aller Beispielwerte. Darüber findet `--undo` sie wieder. */
const MARK = "BEISPIELWERT";
const ACTOR = "Beispieldaten (Demo)";
const EC2 = "Beispiel EC Member 2";
const LIST_PREFIX = "Beispiel: ";
const NAME_SUFFIX = " (Beispiel)";
const TENANT_PREFIX = "TEN-DEMO-";
const CSV_LIST = "Nicht angegeben (CSV)";

const LIST_BY_ETS: Record<string, string> = {
  ETS1: "Embargoland", ETR1: "Embargoregion", ETS2: "In Prüfung", ETS3: "Untersuchung",
  ETS4: "US-SDN-Liste", ETS5: "EU-Handelsbeschränkung", ETS6: "Länderentscheidung SAP",
};
const LOBS = [
  { lob: "SuccessFactors", product: "Employee Central" },
  { lob: "SuccessFactors", product: "Learning" },
  { lob: "Cloud ERP", product: "S/4HANA Cloud" },
  { lob: "Ariba", product: "Ariba Network" },
  { lob: "Concur", product: "Concur Expense" },
];
const PEOPLE = [
  ["L. Wang", "Y. Chen", "H. Zhou"], ["C. Ortega", "J. Alves", "M. Ruiz"], ["R. Haddad", "N. Farouk", "S. Amari"],
  ["E. Kaya", "S. Demir", "B. Aydın"], ["P. Novak", "K. Horvath", "T. Berger"], ["A. Mehta", "P. Iyer", "R. Nair"],
];
const RESULTS: Record<StepKey, string> = {
  suser: "S-User gesperrt", tickets: "Offene Tickets geschlossen", remote: "Remote-Zugang gesperrt",
  cloud: "Alle Tenants gesperrt", notify: "AE und Landesverantwortliche informiert",
};

type Plan = { decision: Exclude<Decision, "pending"> | "pending"; steps: number; comment?: string };

const include = { tenants: true, steps: true, audit: { orderBy: { at: "asc" as const } } };
type Row = Awaited<ReturnType<typeof loadPartners>>[number];
function loadPartners() {
  return db.registerPartner.findMany({ include, orderBy: [{ gtsBlockedAt: "asc" }, { bpId: "asc" }] });
}
function view(p: Row): BlockedPartner {
  return {
    id: p.id, stepOrder: p.stepOrder, bpId: p.bpId, erpId: p.erpId, name: p.name, country: p.country, ets: p.ets,
    sanctionsList: p.sanctionsList, gtsBlockedAt: p.gtsBlockedAt.toISOString(), enteredBy: p.enteredBy, decision: p.decision,
    cloudCustomer: p.cloudCustomer, tenants: p.tenants, specialCategory: p.specialCategory, comment: p.comment,
    completed: Object.fromEntries(p.steps.map((s) => [s.key, { at: s.at.toISOString(), by: s.by, result: s.result }])),
    audit: p.audit.map((a) => ({ at: a.at.toISOString(), by: a.by, text: a.text })),
  };
}

/** Nur unberührte Fälle: keine Entscheidung, keine Schritte, noch keine Beispielwerte. */
function untouched(p: Row) {
  return p.decision === "pending" && p.steps.length === 0 && !p.audit.some((a) => a.text.startsWith(MARK));
}

/**
 * Verteilung, deterministisch nach Sperrdatum: die jüngsten Fälle bleiben zur Freigabe,
 * ETS5 wird „sanktioniert ohne Sperre“, ETS2 wird abgelehnt (Fehlalarm), ältere Fälle sind abgeschlossen,
 * die neueren freigegebenen Fälle stehen mitten in den Sperrschritten.
 */
function planFor(rows: Row[]): Map<string, Plan> {
  const plans = new Map<string, Plan>();
  const newestFirst = [...rows].reverse();
  const pendingIds = new Set(newestFirst.slice(0, 8).map((r) => r.id));
  let inProgress = 0;
  for (const r of newestFirst) {
    if (pendingIds.has(r.id)) { plans.set(r.id, { decision: "pending", steps: 0 }); continue; }
    if (r.ets === "ETS5") { plans.set(r.id, { decision: "sanctionedNoBlock", steps: 0, comment: "Nur Handels- bzw. Zahlungsbeschränkungen, keine Sperre nötig" }); continue; }
    if (r.ets === "ETS2") { plans.set(r.id, { decision: "declined", steps: 0, comment: "Fehlalarm nach manueller Prüfung" }); continue; }
    if (inProgress < 8) { plans.set(r.id, { decision: "approved", steps: inProgress % 4 }); inProgress++; continue; }
    plans.set(r.id, { decision: "approved", steps: 5 });
  }
  return plans;
}

/** Zeitpunkte nach dem letzten echten Verlaufseintrag, damit der Audit-Trail chronologisch bleibt. */
function later(d: Date, minutes: number) {
  return new Date(d.getTime() + minutes * 60_000);
}

async function apply(dryRun: boolean) {
  const now = new Date();
  const rows = (await loadPartners()).filter(untouched);
  const plans = planFor(rows);
  const summary = { tenants: 0, lists: 0, approved: 0, sanctionedNoBlock: 0, declined: 0, pending: 0, steps: 0, contacts: 0 };
  let cloudNo = 0;

  await db.$transaction(async (tx) => {
    for (const r of rows) {
      const plan = plans.get(r.id)!;
      const tenants = r.cloudCustomer && r.tenants.length === 0
        ? Array.from({ length: 1 + (cloudNo % 3) }, (_, i) => {
          const l = LOBS[(cloudNo + i) % LOBS.length];
          return { ...l, tenantId: `${TENANT_PREFIX}${1000 + cloudNo * 10 + i}`, ticket: `CLD-DEMO-${3000 + cloudNo}` };
        })
        : [];
      if (tenants.length) cloudNo++;
      const list = r.sanctionsList === CSV_LIST ? LIST_PREFIX + (LIST_BY_ETS[r.ets] ?? "Sanktionsliste") : null;
      summary.tenants += tenants.length; if (list) summary.lists++; summary[plan.decision]++;

      let p: BlockedPartner = { ...view(r), tenants: [...r.tenants, ...tenants] };
      const start = new Date(Math.max(r.gtsBlockedAt.getTime(), ...r.audit.map((a) => a.at.getTime())));
      const marker = later(start, 1);
      let at = later(start, 2);
      if (plan.decision !== "pending") p = decide(p, plan.decision, EC2, plan.comment ?? "", at);
      for (let i = 0; i < plan.steps; i++) {
        const running = (Object.entries(stepStatuses(p)) as [StepKey, string][]).find(([, s]) => s === "running");
        if (!running) break;
        at = later(at, 1);
        p = completeStep(p, running[0], ACTOR, `${LIST_PREFIX}${RESULTS[running[0]]}`, at);
      }
      const newSteps = (Object.keys(p.completed) as StepKey[]).filter((k) => !r.steps.some((s) => s.key === k));
      summary.steps += newSteps.length;
      if (dryRun) continue;

      await tx.registerPartner.update({ where: { id: r.id }, data: {
        version: { increment: 1 },
        ...(list ? { sanctionsList: list } : {}),
        ...(plan.decision !== "pending" ? { decision: p.decision, decidedBy: p.decidedBy, decidedAt: new Date(p.decidedAt!), decisionComment: p.decisionComment ?? null } : {}),
        tenants: { create: tenants },
        steps: { create: newSteps.map((k) => ({ key: k, at: new Date(p.completed[k]!.at), by: ACTOR, result: p.completed[k]!.result })) },
        audit: { create: [
          { at: marker, by: ACTOR, text: `${MARK}: Erfundene Demo-Werte ergänzt (Tenants, Sanktionsliste, Entscheidung, Schritte). Entfernen mit npm run demo:values -- --undo.` },
          ...p.audit.slice(r.audit.length).map((a) => ({ at: new Date(a.at), by: a.by, text: `${MARK}: ${a.text}` })),
        ] },
      } });
    }

    const contacts = await tx.registerContact.findMany({ orderBy: { region: "asc" } });
    for (const [i, c] of contacts.entries()) {
      const [gd, lh, cd] = PEOPLE[i % PEOPLE.length].map((n) => n + NAME_SUFFIX);
      const data = {
        ...(c.generalDirector ? {} : { generalDirector: gd }),
        ...(c.legalHead ? {} : { legalHead: lh }),
        ...(c.commercialDirector || i % 3 === 2 ? {} : { commercialDirector: cd }),
        ...(c.lastChecked ? {} : { lastChecked: new Date(now.getTime() - (i % 2 ? 12 : 2) * 86_400_000) }),
      };
      if (!Object.keys(data).length) continue;
      summary.contacts++;
      if (!dryRun) await tx.registerContact.update({ where: { id: c.id }, data });
    }
  }, { timeout: 120_000 });

  console.log(`${dryRun ? "Probelauf, nichts geschrieben" : "Beispielwerte geschrieben"}: ${rows.length} unberührte Kunden.`);
  console.log(`  Zur Freigabe ${summary.pending}, freigegeben ${summary.approved}, sanktioniert ohne Sperre ${summary.sanctionedNoBlock}, abgelehnt ${summary.declined}`);
  console.log(`  ${summary.steps} erledigte Sperrschritte, ${summary.tenants} Tenants, ${summary.lists} Sanktionslisten, ${summary.contacts} Länder-Kontakte`);
}

async function undo(dryRun: boolean) {
  const rows = await db.registerPartner.findMany({ include, where: { audit: { some: { text: { startsWith: MARK } } } } });
  const contacts = await db.registerContact.findMany();
  console.log(`${dryRun ? "Probelauf" : "Entferne"}: Beispielwerte bei ${rows.length} Kunden und ${contacts.length} Kontaktregionen.`);
  if (dryRun) return;
  await db.$transaction(async (tx) => {
    for (const r of rows) {
      // Änderungen, die das Team nach dem Seed selbst gemacht hat, bleiben im Audit erhalten.
      const decidedByDemo = r.decidedBy === EC2 && r.steps.every((s) => s.by === ACTOR);
      await tx.registerTenant.deleteMany({ where: { partnerId: r.id, tenantId: { startsWith: TENANT_PREFIX } } });
      await tx.registerStep.deleteMany({ where: { partnerId: r.id, by: ACTOR } });
      await tx.registerAudit.deleteMany({ where: { partnerId: r.id, text: { startsWith: MARK } } });
      await tx.registerPartner.update({ where: { id: r.id }, data: {
        version: { increment: 1 },
        ...(r.sanctionsList.startsWith(LIST_PREFIX) ? { sanctionsList: CSV_LIST } : {}),
        ...(decidedByDemo ? { decision: "pending", decidedBy: null, decidedAt: null, decisionComment: null } : {}),
      } });
    }
    for (const c of contacts) {
      const clear = (v: string) => (v.endsWith(NAME_SUFFIX) ? "" : v);
      await tx.registerContact.update({ where: { id: c.id }, data: {
        generalDirector: clear(c.generalDirector), legalHead: clear(c.legalHead), commercialDirector: clear(c.commercialDirector),
        ...([c.generalDirector, c.legalHead, c.commercialDirector].some((v) => v.endsWith(NAME_SUFFIX)) ? { lastChecked: null } : {}),
      } });
    }
  }, { timeout: 120_000 });
  console.log("Beispielwerte entfernt.");
}

const args = process.argv.slice(2);
(args.includes("--undo") ? undo(args.includes("--dry-run")) : apply(args.includes("--dry-run")))
  .catch((error: unknown) => {
    // Datenbankfehler können Verbindungsdaten enthalten; keine Zugangsdaten ausgeben.
    console.error(error instanceof Error && !error.message.includes("prisma") ? error.message : "Fehlgeschlagen; Transaktion zurückgerollt.");
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
