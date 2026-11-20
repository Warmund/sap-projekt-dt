import { db } from "../db";
import type { Prisma } from "../generated/prisma/client";
import { advance, completeStep, decide, stepStatuses, STEP_DEFS, STEP_ORDER } from "./workflow";
import type { BlockedPartner, CountryContact, Decision, StepKey } from "./types";

export class RegisterError extends Error {}

const include = { tenants: true, steps: true, audit: { orderBy: { at: "asc" as const } } };
type PartnerRow = Prisma.RegisterPartnerGetPayload<{ include: typeof include }>;
function partnerView(p: PartnerRow): BlockedPartner {
  return {
    id: p.id, bpId: p.bpId, erpId: p.erpId, name: p.name, country: p.country, region: p.region,
    ets: p.ets, sanctionsList: p.sanctionsList, listReference: p.listReference ?? undefined,
    gtsBlockedAt: p.gtsBlockedAt.toISOString(), gtsDateOnly: p.gtsDateOnly, enteredBy: p.enteredBy,
    decidedBy: p.decidedBy ?? undefined, decidedAt: p.decidedAt?.toISOString(), decision: p.decision,
    decisionComment: p.decisionComment ?? undefined, cloudCustomer: p.cloudCustomer,
    tenants: p.tenants.map(({ lob, product, tenantId, ticket }) => ({ lob, product, tenantId, ticket })),
    specialCategory: p.specialCategory, specialComment: p.specialComment ?? undefined, comment: p.comment,
    completed: Object.fromEntries(p.steps.flatMap(({ key, at, by, result }) =>
      key === "tickets" || key === "remote" ? [] : [[key, { at: at.toISOString(), by, result }]])),
    audit: p.audit.map(({ at, by, text }) => ({ at: at.toISOString(), by, text })),
    spl: p.spl, ruItConsultancyBan: p.ruItConsultancyBan, ukraineCrisis: p.ukraineCrisis, version: p.version,
  };
}

export async function readRegister() {
  const [partners, contacts] = await Promise.all([
    db.registerPartner.findMany({ include, orderBy: [{ gtsBlockedAt: "desc" }, { bpId: "asc" }] }),
    db.registerContact.findMany({ orderBy: { region: "asc" } }),
  ]);
  return { partners: partners.map(partnerView), contacts: contacts.map((c) => ({ ...c, lastChecked: c.lastChecked?.toISOString() ?? null })) };
}
export type RegisterData = Awaited<ReturnType<typeof readRegister>>;
export type RegisterCommand =
  | { kind: "create"; partner: BlockedPartner }
  | { kind: "decide"; id: string; version: number; decision: Exclude<Decision, "pending">; comment: string }
  | { kind: "complete"; id: string; version: number; step: StepKey; result?: string }
  | { kind: "advance"; id: string; version: number }
  | { kind: "contact"; contact: CountryContact };

function text(value: unknown, max = 500, required = true): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new RegisterError("Ungültige oder fehlende Textangabe.");
  return value.trim();
}
export async function changeRegister(command: RegisterCommand, actor: { id: string; name: string }) {
  if (!command || typeof command !== "object") throw new RegisterError("Ungültige Registeraktion.");
  if (command.kind === "contact") {
    const c = command.contact;
    if (!c || !Array.isArray(c.countries) || c.countries.length > 250) throw new RegisterError("Ungültige Länderliste.");
    await db.registerContact.update({ where: { id: text(c.id) }, data: {
      generalDirector: text(c.generalDirector, 200, false), legalHead: text(c.legalHead, 200, false),
      commercialDirector: text(c.commercialDirector, 200, false), countries: c.countries.map((v) => text(v, 100)), lastChecked: new Date(),
    } });
    return;
  }
  if (command.kind === "create") {
    const p = command.partner;
    if (!p || !["ETS1", "ETR1", "ETS2", "ETS3", "ETS4", "ETS5", "ETS6"].includes(p.ets) ||
        ![null, "SR", "Sonstige"].includes(p.specialCategory) || typeof p.cloudCustomer !== "boolean" ||
        !Array.isArray(p.tenants) || p.tenants.length > 100) throw new RegisterError("Ungültiger Geschäftspartner.");
    const blockedAt = new Date(p.gtsBlockedAt);
    if (!Number.isFinite(blockedAt.getTime())) throw new RegisterError("Ungültiges Sperrdatum.");
    const bpId = text(p.bpId, 100);
    await db.registerPartner.create({ data: {
      bpId, erpId: text(p.erpId, 100), name: text(p.name, 300), country: text(p.country, 100), ets: p.ets,
      sanctionsList: text(p.sanctionsList, 300), listReference: text(p.listReference ?? "", 1000, false),
      gtsBlockedAt: blockedAt, comment: text(p.comment, 10_000, false), specialCategory: p.specialCategory,
      specialComment: text(p.specialComment ?? "", 2000, false), cloudCustomer: p.cloudCustomer,
      enteredBy: actor.name, enteredByUserId: actor.id,
      tenants: { create: p.tenants.map((t) => ({ lob: text(t.lob, 200), product: text(t.product, 200), tenantId: text(t.tenantId, 200), ticket: text(t.ticket, 500, false) })) },
      audit: { create: { by: actor.name, text: "Datensatz angelegt (simulierter GTS-Eingang); zur Vier-Augen-Prüfung." } },
    } });
    return;
  }
  if (!["decide", "complete", "advance"].includes(command.kind)) throw new RegisterError("Unbekannte Registeraktion.");
  const id = text(command.id);
  if (!Number.isSafeInteger(command.version) || command.version < 0) throw new RegisterError("Ungültige Datensatzversion.");
  await db.$transaction(async (tx) => {
    const row = await tx.registerPartner.findUniqueOrThrow({ where: { id }, include });
    if (row.version !== command.version) throw new RegisterError("Datensatz wurde inzwischen geändert. Bitte neu laden.");
    const p = partnerView(row);
    let next: BlockedPartner;
    if (command.kind === "decide") {
      if (!["approved", "sanctionedNoBlock", "declined"].includes(command.decision)) throw new RegisterError("Ungültige Entscheidung.");
      const comment = text(command.comment, 2000, command.decision !== "approved");
      if (row.enteredByUserId === actor.id) throw new RegisterError("Vier-Augen-Prinzip: Eine andere Person muss entscheiden.");
      if (p.decision !== "pending") throw new RegisterError("Dieser Datensatz wurde bereits entschieden.");
      next = decide(p, command.decision, actor.name, comment);
    } else {
      if (command.kind === "complete") {
        if (!STEP_ORDER.includes(command.step)) throw new RegisterError("Ungültiger Sperrschritt.");
        if (stepStatuses(p)[command.step] !== "running") throw new RegisterError("Dieser Schritt ist noch nicht freigegeben oder bereits erledigt.");
        if (command.step === "cloud" && !p.tenants.length) throw new RegisterError("Cloud-Tenants fehlen. Cloud-Sperre kann nicht als erledigt bestätigt werden.");
        const result = text(command.result ?? STEP_DEFS[command.step].doneText, 2000);
        next = completeStep(p, command.step, actor.name, result);
      } else {
        // The prototype simulation is recorded explicitly; it never operates external systems.
        if (stepStatuses(p).cloud === "running" && !p.tenants.length) throw new RegisterError("Cloud-Tenants fehlen; keine simulierte Cloud-Erledigung möglich.");
        next = advance(p);
        next.audit = next.audit.map((entry, i) => i < p.audit.length ? entry : { ...entry, by: actor.name, text: `SIMULIERT: ${entry.text}` });
      }
    }
    const changed = await tx.registerPartner.updateMany({ where: { id, version: command.version }, data: {
      version: { increment: 1 }, decision: next.decision, decidedBy: next.decidedBy,
      decidedAt: next.decidedAt ? new Date(next.decidedAt) : undefined, decisionComment: next.decisionComment,
    } });
    if (changed.count !== 1) throw new RegisterError("Datensatz wurde inzwischen geändert. Bitte neu laden.");
    for (const key of STEP_ORDER) {
      const step = next.completed[key];
      if (step && !p.completed[key]) await tx.registerStep.create({ data: { partnerId: id, key, at: new Date(step.at), by: command.kind === "advance" ? actor.name : step.by, result: command.kind === "advance" ? `SIMULIERT: ${step.result}` : step.result } });
    }
    await tx.registerAudit.createMany({ data: next.audit.slice(p.audit.length).map((entry) => ({ partnerId: id, at: new Date(entry.at), by: entry.by, text: entry.text })) });
  });
}
