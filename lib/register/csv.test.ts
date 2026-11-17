import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCustomersCsv } from "./csv";
const header = 'Customer Name,ERP#,CRM,Country,Region,ETS Category,Date of blocking,Comment,SPL,SR,Cloud,RU IT consultancy BAN,Ukraine Crisis\r\n';
const row = '"Test, GmbH",001,002,Austria,EMEA,ETS3,29.02.2024,"Text ""quoted""\nnext line",Yes,No,Yes,No,Yes';
const parse = (s: string) => parseCustomersCsv(Buffer.from(s));
test("quoted CSV, leading zero IDs, dates and independent flags are preserved", () => {
  const [p] = parse(header + row);
  assert.equal(p.name, "Test, GmbH"); assert.equal(p.bpId, "002"); assert.equal(p.erpId, "001");
  assert.equal(p.comment, 'Text "quoted"\nnext line');
  assert.equal(p.gtsBlockedAt.toISOString(), "2024-02-29T00:00:00.000Z");
  assert.equal(p.spl, true); assert.equal(p.specialCategory, null); assert.equal(p.cloudCustomer, true);
});
test("Windows-1252 punctuation is decoded without data loss", () => {
  const bytes = Buffer.from(header + row.replace("next line", "next\x96line"), "latin1");
  assert.match(parseCustomersCsv(bytes)[0].comment, /next–line/);
});
test("invalid dates, flags, categories, headers, duplicate IDs and broken quoting reject the import", () => {
  for (const bad of [row.replace("29.02.2024", "31.02.2024"), row.replace("ETS3", "ETS9"), row.replace("Yes,No,Yes", "Maybe,No,Yes"), row.slice(0, -3), row + '\n' + row, row + ',"unclosed']) {
    assert.throws(() => parse(header + bad));
  }
  assert.throws(() => parse(header.replace("CRM", "BP") + row));
});
