import "dotenv/config";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { db } from "../lib/db";
import { parseCustomersCsv } from "../lib/register/csv";

async function main() {
  const path = process.argv[2];
  if (!path) throw new Error('Aufruf: npm run import:customers -- "/pfad/kunden.csv"');
  const rows = parseCustomersCsv(await readFile(path));
  const sourceFile = basename(path);
  const result = await db.$transaction(async (tx) => {
    let inserted = 0;
    for (const row of rows) {
      // A repeated import never resets decisions, tasks, tenants or audit history.
      const existing = await tx.registerPartner.findUnique({ where: { bpId: row.bpId } });
      if (existing) {
        if (existing.sourceFile !== sourceFile) throw new Error(`CRM-ID in Datensatz ${row.sourceRow} gehört bereits zu einer anderen Quelle.`);
        continue;
      }
      await tx.registerPartner.create({ data: {
        ...row, sourceFile, enteredBy: "CSV-Import (EC-Mitarbeiter nicht angegeben)",
        sanctionsList: "Nicht angegeben (CSV)", sanctionsLists: ["Nicht angegeben (CSV)"],
        tags: row.specialCategory === "SR" ? { connect: { id: "successroom" } } : undefined,
        audit: { create: { by: "CSV-Import", text: `Aus ${sourceFile}, Datensatz ${row.sourceRow} übernommen. CRM als BP-ID; Freigabe und Sperrschritte nicht in der Quelle enthalten.` } },
      } });
      inserted++;
    }
    const regions = new Map<string, Set<string>>();
    for (const row of rows) {
      if (!regions.has(row.region)) regions.set(row.region, new Set());
      regions.get(row.region)!.add(row.country);
    }
    for (const [region, countries] of regions) {
      await tx.registerContact.upsert({ where: { region }, update: {}, create: { region, countries: [...countries].sort() } });
    }
    return { inserted, skipped: rows.length - inserted };
  }, { timeout: 60_000 });
  const stored = await db.registerPartner.count({ where: { sourceFile } });
  if (stored < rows.length) throw new Error("Nachprüfung des Imports fehlgeschlagen.");
  console.log(`Import abgeschlossen: ${result.inserted} neu, ${result.skipped} bereits vorhanden; ${stored} Datensätze dieser Quelle gespeichert.`);
}
main().catch((error: unknown) => {
  // Database errors can include connection details; do not print credentials.
  console.error(error instanceof Error && !error.message.includes("prisma") ? error.message : "Datenbankimport fehlgeschlagen; Transaktion zurückgerollt.");
  process.exitCode = 1;
}).finally(() => db.$disconnect());
