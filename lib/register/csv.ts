const HEADERS = ["Customer Name", "ERP#", "CRM", "Country", "Region", "ETS Category", "Date of blocking", "Comment", "SPL", "SR", "Cloud", "RU IT consultancy BAN", "Ukraine Crisis"];
const ETS = ["ETS1", "ETR1", "ETS2", "ETS3", "ETS4", "ETS5", "ETS6"] as const;

/** RFC-4180 fields, including escaped quotes and embedded line breaks. */
function rowsOf(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(field); field = ""; closed = false;
      if (c !== ',') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        if (row.some((v) => v !== "")) rows.push(row);
        row = [];
      }
    } else if (c === '"' && field === "" && !closed) quoted = true;
    else {
      if (closed || c === '"') throw new Error("Ungültige CSV-Anführungszeichen.");
      field += c;
    }
  }
  if (quoted) throw new Error("Nicht geschlossenes CSV-Feld.");
  row.push(field);
  if (row.some((v) => v !== "")) rows.push(row);
  return rows;
}

export function parseCustomersCsv(bytes: Uint8Array) {
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { text = new TextDecoder("windows-1252", { fatal: true }).decode(bytes); }
  const [headers, ...rows] = rowsOf(text.replace(/^\uFEFF/, ""));
  if (JSON.stringify(headers) !== JSON.stringify(HEADERS)) throw new Error("CSV-Spalten stimmen nicht mit dem Kundenformat überein.");
  if (!rows.length) throw new Error("CSV enthält keine Kunden.");
  const ids = new Set<string>();
  return rows.map((row, index) => {
    const line = index + 2;
    const fail = (message: string): never => { throw new Error(`CSV-Datensatz ${line}: ${message}`); };
    if (row.length !== HEADERS.length) fail("Falsche Spaltenanzahl.");
    const [name, erpId, bpId, country, region, etsValue, date, comment, spl, sr, cloud, ruBan, ukraine] = row.map((s) => s.trim());
    if (!name || !country || !region || !/^\d+$/.test(erpId) || !/^\d+$/.test(bpId)) fail("Name, Land, Region oder IDs fehlen/sind ungültig.");
    if (ids.has(bpId)) fail("Doppelte CRM-ID.");
    ids.add(bpId);
    const ets = ETS.find((value) => value === etsValue) ?? fail("Unbekannte ETS-Kategorie.");
    const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date) ?? fail("Sperrdatum muss TT.MM.JJJJ sein.");
    const iso = `${match[3]}-${match[2]}-${match[1]}`;
    const gtsBlockedAt = new Date(`${iso}T00:00:00.000Z`);
    if (!Number.isFinite(gtsBlockedAt.getTime()) || gtsBlockedAt.toISOString().slice(0, 10) !== iso) fail("Ungültiges Kalenderdatum.");
    const yesNo = (value: string) => value === "Yes" ? true : value === "No" ? false : fail("Kennzeichen muss Yes oder No sein.");
    return {
      name, erpId, bpId, country, region, ets, gtsBlockedAt, gtsDateOnly: true, comment,
      spl: yesNo(spl), specialCategory: yesNo(sr) ? "SR" as const : null,
      cloudCustomer: yesNo(cloud), ruItConsultancyBan: yesNo(ruBan), ukraineCrisis: yesNo(ukraine), sourceRow: line,
    };
  });
}
