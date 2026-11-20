// Excel-Export der Stammdaten, unabhängig von React. Die Bausteine liefern Tabellenblätter, der Browser-Teil lädt sie herunter.
import type { BlockedPartner, CountryContact } from "./types";
import { formatDate, overallStatus } from "./workflow";

type Translator = (message: string, ...args: (string | number | undefined)[]) => string;
type Cell = { value: string | number | boolean | Date; type?: StringConstructor | NumberConstructor | BooleanConstructor | DateConstructor; fontWeight?: "bold"; format?: string; wrap?: boolean; align?: "left" } | null;
export type Sheet = { sheet: string; data: Cell[][]; columns: { width: number }[]; stickyRowsCount: number };

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** IDs bleiben Text, damit führende Nullen erhalten bleiben. */
const text = (value: string | undefined | null): Cell => value ? { value, type: String } : null;
const header = (label: string): Cell => ({ value: label, type: String, fontWeight: "bold" });
const yesNo = (value: boolean | null | undefined, t: Translator): Cell => ({ value: value == null ? t("Nicht angegeben") : value ? t("Ja") : t("Nein"), type: String });

/** Kalendertag wie in der Oberfläche (Europe/Berlin) als Excel-Datum, ohne Zeitzonenverschiebung. */
function calendarDate(iso: string): Cell {
  const [day, month, year] = formatDate(iso, "de").split(".").map(Number);
  return { value: new Date(Date.UTC(year, month - 1, day)), type: Date, format: "dd.mm.yyyy" };
}

function sheet(name: string, headers: string[], rows: Cell[][], widths: number[]): Sheet {
  return { sheet: name, data: [headers.map(header), ...rows], columns: widths.map((width) => ({ width })), stickyRowsCount: 1 };
}

/** Blatt "Stammdaten": eine Zeile je Geschäftspartner, Spalten wie auf dem Detailbildschirm. */
export function partnersSheet(partners: BlockedPartner[], t: Translator): Sheet {
  const headers = [
    t("Geschäftspartner"), t("BP-ID (GTS)"), t("ERP-ID"), t("Land"), t("Region"), t("ETS-Kategorie"), t("Sanktionsliste"),
    t("Referenz auf Listeneintrag"), "SPL", "RU IT Consultancy Ban", t("Ukraine Crisis"), t("Cloud-Kunde"), t("Tenants"),
    t("Sonderkategorie"), "Tags", t("GTS-Sperre"), t("Status"), t("Kommentar"),
  ];
  const rows = partners.map((p): Cell[] => [
    text(p.name), text(p.bpId), text(p.erpId), text(t(p.country)), text(p.region), text(p.ets),
    text((p.sanctionsLists ?? [p.sanctionsList]).map((value) => t(value)).join(", ")), text(p.listReference),
    yesNo(p.spl, t), yesNo(p.ruItConsultancyBan, t), yesNo(p.ukraineCrisis, t), yesNo(p.cloudCustomer, t), { value: p.tenants.length, type: Number },
    text(p.specialCategory ? t(p.specialCategory) : ""), text(p.tags?.map((tag) => tag.name).join(", ")),
    calendarDate(p.gtsBlockedAt), text(t(overallStatus(p))), text(p.comment === "Keine Anmerkungen." ? t(p.comment) : p.comment),
  ]);
  return sheet(t("Stammdaten"), headers, rows, [32, 12, 12, 18, 12, 10, 24, 24, 8, 20, 14, 12, 9, 16, 20, 13, 24, 50]);
}

/** Blatt "Cloud-Tenants": eine Zeile je Tenant, nur wenn mindestens ein Kunde Tenants hat. */
export function tenantsSheet(partners: BlockedPartner[], t: Translator): Sheet | null {
  const rows = partners.flatMap((p) => p.tenants.map((tenant): Cell[] => [
    text(p.name), text(p.bpId), text(tenant.lob), text(tenant.product), text(tenant.tenantId), text(tenant.ticket ? t(tenant.ticket) : ""),
  ]));
  if (!rows.length) return null;
  return sheet(t("Cloud-Tenants"), [t("Geschäftspartner"), t("BP-ID (GTS)"), "Line of Business", t("Produkt"), t("Tenant-ID"), t("LoB-Ticket")], rows, [32, 12, 22, 28, 22, 20]);
}

/** Blatt "Länder-Kontakte". */
export function contactsSheet(contacts: CountryContact[], t: Translator): Sheet {
  const rows = contacts.map((c): Cell[] => [
    text(c.region), text(c.countries.map((country) => t(country)).join(", ")), text(c.generalDirector), text(c.legalHead), text(c.commercialDirector),
    c.lastChecked ? calendarDate(c.lastChecked) : null,
  ]);
  return sheet(t("Länder-Kontakte"), [t("Region"), t("Länder"), "General Director", "Legal Head", "Commercial Director", t("Geprüft am")], rows, [16, 40, 26, 26, 26, 14]);
}

/** Dateiname mit Datum, z. B. Stammdaten_2026-11-20.xlsx. */
export function exportFileName(base: string, now = new Date()) {
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(now);
  return `${base.replace(/[^\p{L}\p{N}_-]+/gu, "_")}_${day}.xlsx`;
}

/** Erzeugt die .xlsx-Datei im Browser und startet den Download. Die Bibliothek wird erst beim Klick geladen. */
export async function downloadXlsx(sheets: (Sheet | null)[], fileName: string) {
  const { default: writeXlsxFile } = await import("write-excel-file/universal");
  const blob = await writeXlsxFile(sheets.filter((s): s is Sheet => s !== null)).toBlob();
  const url = URL.createObjectURL(new Blob([blob], { type: XLSX_MIME }));
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
