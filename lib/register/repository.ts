import { findGtsPartner } from "./gts";
import { db } from "../db";
import { Prisma } from "../generated/prisma/client";
import { completeStep, decide, notificationPending, stepStatuses, AUTO_RESULT, PERSISTED_STEPS, STEP_DEFS } from "./workflow";
import type { BlockedPartner, CountryContact, Decision, StepKey } from "./types";

export class RegisterError extends Error {}

const include = { tags: true, tenants: true, steps: true, audit: { orderBy: { at: "asc" as const } } };
type PartnerRow = Prisma.RegisterPartnerGetPayload<{ include: typeof include }>;
function partnerView(p: PartnerRow): BlockedPartner {
  return {
    id: p.id, bpId: p.bpId, erpId: p.erpId, name: p.name, country: p.country, region: p.region,
    ets: p.ets, sanctionsList: p.sanctionsList, sanctionsLists: p.sanctionsLists.length ? p.sanctionsLists : [p.sanctionsList].filter(Boolean), tags: p.tags, listReference: p.listReference ?? undefined,
    gtsBlockedAt: p.gtsBlockedAt.toISOString(), gtsDateOnly: p.gtsDateOnly, enteredBy: p.enteredBy,
    decidedBy: p.decidedBy ?? undefined, decidedAt: p.decidedAt?.toISOString(), decision: p.decision,
    decisionComment: p.decisionComment ?? undefined, cloudCustomer: p.cloudCustomer,
    tenants: p.tenants.map(({ lob, product, tenantId, ticket }) => ({ lob, product, tenantId, ticket })),
    specialCategory: p.specialCategory, specialComment: p.specialComment ?? undefined, comment: p.comment,
    completed: Object.fromEntries(p.steps.flatMap(({ key, at, by, result }) => {
      if (key === "tickets" || key === "remote" || key === "serviceNow" || key === "scg") return [];
      if ((key === "irdp" || key === "bcp") && (result === AUTO_RESULT || result.startsWith("SIMULIERT: "))) return [];
      if (key === "notify" && result.startsWith("SIMULIERT: ")) return [];
      return [[key, { at: at.toISOString(), by, result }]];
    })),
    audit: p.audit.map(({ at, by, text }) => ({ at: at.toISOString(), by, text })),
    spl: p.spl, ruItConsultancyBan: p.ruItConsultancyBan, ukraineCrisis: p.ukraineCrisis, version: p.version,
  };
}

export async function readRegister() {
  const [partners, contacts, tags] = await Promise.all([
    db.registerPartner.findMany({ include, orderBy: [{ gtsBlockedAt: "desc" }, { bpId: "asc" }] }),
    db.registerContact.findMany({ orderBy: { region: "asc" } }),
    db.registerTag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return { tags, partners: partners.map(partnerView), contacts: contacts.map((c) => ({ ...c, lastChecked: c.lastChecked?.toISOString() ?? null })) };
}
export type RegisterData = Awaited<ReturnType<typeof readRegister>>;
export type RegisterCommand =
  | { kind: "create"; partner: BlockedPartner }
  | { kind: "createFromGts"; bpId: string; tagIds: string[] }
  | { kind: "createTag"; name: string }
  | { kind: "setTags"; id: string; version: number; tagIds: string[] }
  | { kind: "decide"; id: string; version: number; decision: Exclude<Decision, "pending">; comment: string }
  | { kind: "complete"; id: string; version: number; step: StepKey; result?: string }
  | { kind: "confirmNotifications"; customers: { id: string; version: number }[] }
  | { kind: "contact"; contact: CountryContact };

function text(value: unknown, max = 500, required = true): string {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) throw new RegisterError("Ungültige oder fehlende Textangabe.");
  return value.trim();
}
function validateTagIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 100) throw new RegisterError("Ungültige Tag-Auswahl.");
  const ids = value.map((id) => text(id, 100));
  if (new Set(ids).size !== ids.length) throw new RegisterError("Ungültige Tag-Auswahl.");
  return ids;
}

export async function lookupGtsPartner(value: string) {
  if (typeof value !== "string" || !value.trim() || value.length > 100) {
    throw new RegisterError("Gib eine Business Partner ID ein.");
  }
  const partner = findGtsPartner(value.trim());
  if (!partner) throw new RegisterError("Für diese Business Partner ID sind keine Demo-Daten verfügbar.");
  if (await db.registerPartner.findUnique({ where: { bpId: partner.bpId }, select: { id: true } })) {
    throw new RegisterError("Diese Business Partner ID ist bereits im Register.");
  }
  return partner;
}

export async function changeRegister(command: RegisterCommand, actor: { id: string; name: string }) {
  if (!command || typeof command !== "object") throw new RegisterError("Ungültige Registeraktion.");
  if (command.kind === "createTag") {
    const name = text(command.name, 100);
    try { await db.registerTag.create({ data: { name } }); }
    catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new RegisterError("Dieses Tag existiert bereits.");
      throw error;
    }
    return;
  }
  if (command.kind === "setTags") {
    const id = text(command.id);
    const tagIds = validateTagIds(command.tagIds);
    await db.$transaction(async (tx) => {
      if (await tx.registerTag.count({ where: { id: { in: tagIds } } }) !== tagIds.length) throw new RegisterError("Ein ausgewähltes Tag existiert nicht mehr.");
      const changed = await tx.registerPartner.updateMany({ where: { id, version: command.version }, data: { version: { increment: 1 } } });
      if (changed.count !== 1) throw new RegisterError("Datensatz wurde inzwischen geändert. Bitte neu laden.");
      await tx.registerPartner.update({ where: { id }, data: { tags: { set: tagIds.map((id) => ({ id })) }, audit: { create: { by: actor.name, text: "Tags aktualisiert" } } } });
    });
    return;
  }
  if (command.kind === "contact") {
    const c = command.contact;
    if (!c || !Array.isArray(c.countries) || c.countries.length > 250) throw new RegisterError("Ungültige Länderliste.");
    await db.registerContact.update({ where: { id: text(c.id) }, data: {
      generalDirector: text(c.generalDirector, 200, false), legalHead: text(c.legalHead, 200, false),
      commercialDirector: text(c.commercialDirector, 200, false), countries: c.countries.map((v) => text(v, 100)), lastChecked: new Date(),
    } });
    return;
  }
  if (command.kind === "create" || command.kind === "createFromGts") {
    const p = command.kind === "createFromGts" ? await lookupGtsPartner(command.bpId) : command.partner;
    if (!p || !["ETS1", "ETR1", "ETS2", "ETS3", "ETS4", "ETS5", "ETS6"].includes(p.ets) ||
        ![null, "SR", "Sonstige"].includes(p.specialCategory) || typeof p.cloudCustomer !== "boolean" ||
        !Array.isArray(p.tenants) || p.tenants.length > 100) throw new RegisterError("Ungültiger Geschäftspartner.");
    const tagIds = command.kind === "createFromGts" ? validateTagIds(command.tagIds) : [];
    if (await db.registerTag.count({ where: { id: { in: tagIds } } }) !== tagIds.length) throw new RegisterError("Ein ausgewähltes Tag existiert nicht mehr.");
    const blockedAt = new Date(p.gtsBlockedAt);
    if (!Number.isFinite(blockedAt.getTime())) throw new RegisterError("Ungültiges Sperrdatum.");
    const bpId = text(p.bpId, 100);
    try {
      await db.registerPartner.create({ data: {
        bpId, erpId: text(p.erpId, 100), name: text(p.name, 300), country: text(p.country, 100), ets: p.ets,
        sanctionsList: text(p.sanctionsList, 300), sanctionsLists: (p.sanctionsLists?.length ? p.sanctionsLists : [p.sanctionsList]).map((value) => text(value, 300)), tags: { connect: tagIds.map((id) => ({ id })) }, listReference: text(p.listReference ?? "", 1000, false),
        region: text(p.region ?? "", 100, false), gtsBlockedAt: blockedAt, gtsDateOnly: p.gtsDateOnly,
        spl: p.spl, ruItConsultancyBan: p.ruItConsultancyBan, ukraineCrisis: p.ukraineCrisis,
        comment: text(p.comment, 10_000, false), specialCategory: p.specialCategory,
        specialComment: text(p.specialComment ?? "", 2000, false), cloudCustomer: p.cloudCustomer,
        enteredBy: actor.name, enteredByUserId: actor.id,
        tenants: { create: p.tenants.map((t) => ({ lob: text(t.lob, 200), product: text(t.product, 200), tenantId: text(t.tenantId, 200), ticket: text(t.ticket, 500, false) })) },
        audit: { create: { by: actor.name, text: "Datensatz angelegt (simulierter GTS-Eingang); zur Vier-Augen-Prüfung." } },
      } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new RegisterError("Diese Business Partner ID ist bereits im Register.");
      }
      throw error;
    }
    return;
  }
  if (command.kind === "confirmNotifications") {
    if (!Array.isArray(command.customers) || !command.customers.length) throw new RegisterError("Wähle mindestens einen Kunden aus.");
    const customers = command.customers.map((customer) => ({ id: text(customer?.id), version: customer?.version }));
    if (new Set(customers.map(({ id }) => id)).size !== customers.length) throw new RegisterError("Ungültige Registeraktion.");
    // Lock customers in the same order for overlapping batches.
    customers.sort((a, b) => a.id.localeCompare(b.id));
    await db.$transaction(async (tx) => {
      for (const customer of customers) await changePartner(tx, { kind: "complete", ...customer, step: "notify" }, actor);
    }, { timeout: 30_000 });
    return;
  }
  if (!["decide", "complete"].includes(command.kind)) throw new RegisterError("Unbekannte Registeraktion.");
  if (command.kind === "complete" && command.step === "notify") throw new RegisterError("Bestätige den Versand unter „Benachrichtigungen“.");
  await db.$transaction((tx) => changePartner(tx, command, actor));
}

type PartnerCommand = Extract<RegisterCommand, { kind: "decide" | "complete" }>;

async function changePartner(tx: Prisma.TransactionClient, command: PartnerCommand, actor: { id: string; name: string }) {
  const id = text(command.id);
  if (!Number.isSafeInteger(command.version) || command.version < 0) throw new RegisterError("Ungültige Datensatzversion.");
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
    if (!PERSISTED_STEPS.some((step) => step === command.step)) throw new RegisterError("Ungültiger Sperrschritt.");
    if (command.step === "notify" ? !notificationPending(p) : stepStatuses(p)[command.step] !== "running") throw new RegisterError("Dieser Schritt ist noch nicht freigegeben oder bereits erledigt.");
    if (command.step === "cloud" && !p.tenants.length) throw new RegisterError("Cloud-Tenants fehlen. Cloud-Sperre kann nicht als erledigt bestätigt werden.");
    const result = text(command.result ?? STEP_DEFS[command.step].doneText, 2000);
    next = completeStep(p, command.step, actor.name, result);
  }
  const changed = await tx.registerPartner.updateMany({ where: { id, version: command.version }, data: {
    version: { increment: 1 }, decision: next.decision, decidedBy: next.decidedBy,
    decidedAt: next.decidedAt ? new Date(next.decidedAt) : undefined, decisionComment: next.decisionComment,
  } });
  if (changed.count !== 1) throw new RegisterError("Datensatz wurde inzwischen geändert. Bitte neu laden.");
  for (const key of PERSISTED_STEPS) {
    const step = next.completed[key];
    if (!step || p.completed[key]) continue;
    const data = { at: new Date(step.at), by: step.by, result: step.result };
    await tx.registerStep.upsert({
      where: { partnerId_key: { partnerId: id, key } },
      create: { partnerId: id, key, ...data },
      update: data,
    });
  }
  await tx.registerAudit.createMany({ data: next.audit.slice(p.audit.length).map((entry) => ({ partnerId: id, at: new Date(entry.at), by: entry.by, text: entry.text })) });
}
