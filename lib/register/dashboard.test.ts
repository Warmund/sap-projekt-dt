import { test } from "node:test";
import assert from "node:assert/strict";
import { MOCK_PARTNERS } from "./mock-data";
import { blockingTimeline, dashboardSummary, matchesRegisterFilter } from "./dashboard";
import type { BlockedPartner, CountryContact } from "./types";
const fixture = (id: string, fields: Partial<BlockedPartner>): BlockedPartner => ({
  ...MOCK_PARTNERS[0], id, decision: "pending", cloudCustomer: false, tenants: [], specialCategory: null, completed: {},
  gtsBlockedAt: "2022-03-01T00:00:00.000Z", ...fields,
});
const partners = [
  fixture("pending", { cloudCustomer: true, specialCategory: "SR" }),
  fixture("approved", { decision: "approved", gtsBlockedAt: "2023-05-01T00:00:00.000Z" }),
  fixture("noBlock", { decision: "sanctionedNoBlock" }),
  fixture("declined", { decision: "declined" }),
];
test("imported pending customers count towards inventory and history, not active tasks", () => {
  const contact: CountryContact = { id: "c", region: "Test", countries: [], generalDirector: "", legalHead: "", commercialDirector: "", lastChecked: null };
  const summary = dashboardSummary(partners, [contact, { ...contact, id: "d", lastChecked: "2026-11-10T00:00:00Z" }], new Date("2026-11-17T00:00:00Z"));
  assert.equal(summary.total, 4); assert.equal(summary.pending, 1); assert.equal(summary.approved, 1);
  assert.equal(summary.noBlock, 1); assert.equal(summary.cloudMissing, 1);
  assert.equal(summary.dueContacts, 2);
  assert.equal(summary.runningSteps.length, 1);
  assert.deepEqual(blockingTimeline(partners, "all"), [{ label: "2022", value: 3 }, { label: "2023", value: 1 }]);
  const months = blockingTimeline(partners, "2023");
  assert.equal(months.length, 12); assert.equal(months[4].value, 1); assert.equal(months.reduce((s, m) => s + m.value, 0), 1);
});
test("dashboard destinations match the counted cases including empty subsets", () => {
  const ids = (filter: Parameters<typeof matchesRegisterFilter>[1]) => partners.filter((p) => matchesRegisterFilter(p, filter)).map((p) => p.id);
  assert.deepEqual(ids("pending"), ["pending"]); assert.deepEqual(ids("open"), ["approved"]);
  assert.deepEqual(ids("cloudMissing"), ["pending"]);
  assert.deepEqual(ids("noBlock"), ["noBlock"]); assert.equal(ids("all").length, 4);
  assert.equal(dashboardSummary([], []).total, 0); assert.deepEqual(blockingTimeline([], "all"), []);
});
