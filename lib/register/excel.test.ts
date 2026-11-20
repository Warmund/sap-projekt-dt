import { test } from "node:test";
import assert from "node:assert/strict";
import { unzipSync, strFromU8 } from "fflate";
import writeXlsxFile from "write-excel-file/universal";
import { contactsSheet, exportFileName, partnersSheet, tenantsSheet } from "./excel";
import type { BlockedPartner } from "./types";

const t = (message: string) => message;
const partner: BlockedPartner = {
  id: "1", bpId: "0002", erpId: "0001", name: "Test, GmbH", country: "Austria", region: "EMEA", spl: true, ruItConsultancyBan: null, ukraineCrisis: false,
  ets: "ETS3", sanctionsList: "EU", sanctionsLists: ["EU", "OFAC"], tags: [{ id: "t", name: "Wichtig" }], gtsBlockedAt: "2024-02-29T00:00:00.000Z", gtsDateOnly: true,
  enteredBy: "x", decision: "pending", cloudCustomer: true, tenants: [{ lob: "LoB", product: "Prod", tenantId: "T1", ticket: "" }],
  specialCategory: "SR", comment: "=HYPERLINK(\"http://example.com\")", completed: {}, audit: [],
};

async function read(sheets: Parameters<typeof writeXlsxFile>[0]) {
  const files = unzipSync(new Uint8Array(await (await writeXlsxFile(sheets).toBlob()).arrayBuffer()));
  return Object.fromEntries(Object.entries(files).map(([name, bytes]) => [name, strFromU8(bytes)]));
}

test("master data keeps leading zeros and text that looks like a formula as text", async () => {
  const files = await read([partnersSheet([partner], t), tenantsSheet([partner], t)!]);
  const strings = files["xl/sharedStrings.xml"] ?? Object.values(files).join("");
  assert.match(strings, />0002</); assert.match(strings, />0001</); assert.match(strings, /Test, GmbH/); assert.match(strings, /EU, OFAC/);
  assert.doesNotMatch(files["xl/worksheets/sheet1.xml"], /<f>/, "no cell may become a formula");
  assert.match(files["xl/workbook.xml"], /name="Stammdaten"/); assert.match(files["xl/workbook.xml"], /name="Cloud-Tenants"/);
});

test("blocking date is the calendar day, 29.02.2024 = Excel serial 45351", async () => {
  const files = await read([partnersSheet([partner], t)]);
  assert.match(files["xl/worksheets/sheet1.xml"], /<v>45351<\/v>/);
});

test("tenants sheet is omitted when nobody has tenants, empty contacts still produce a sheet", () => {
  assert.equal(tenantsSheet([{ ...partner, tenants: [] }], t), null);
  assert.equal(contactsSheet([], t).data.length, 1);
});

test("file names carry the Berlin date and no unsafe characters", () => {
  assert.equal(exportFileName("Stammdaten_0002", new Date("2026-11-20T23:30:00Z")), "Stammdaten_0002_2026-11-21.xlsx");
  assert.equal(exportFileName("a/b: c"), exportFileName("a_b_c"));
});
