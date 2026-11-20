import { AUTO_RESULT, stepStatuses } from "./workflow";
import "dotenv/config";
import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { db } from "../db";
import { changeRegister, readRegister } from "./repository";
import type { BlockedPartner } from "./types";

test("persistent lifecycle: two-person review, ordering, stale writes, audit, missing cloud data", { skip: process.env.RUN_REGISTER_INTEGRATION !== "1" }, async () => {
  const bpId = `test-${randomUUID()}`;
  const maker = { id: "integration-maker", name: "Integration Maker" };
  const reviewer = { id: "integration-reviewer", name: "Integration Reviewer" };
  const input: BlockedPartner = {
    id: "ignored-client-id", bpId, erpId: "test-erp", name: "Integration fixture", country: "Test", ets: "ETS3",
    gtsBlockedAt: "2026-11-17T12:34:56.000Z", enteredBy: "Untrusted client", sanctionsList: "Test list", decision: "approved",
    cloudCustomer: true, tenants: [], specialCategory: null, comment: "Temporary integration fixture", completed: {}, audit: [],
  };
  try {
    const successRoom = await db.registerTag.findUniqueOrThrow({ where: { name: "SuccessRoom" } });
    await changeRegister({ kind: "createTag", name: "Integration Tag" }, maker);
    const newTag = await db.registerTag.findUniqueOrThrow({ where: { name: "Integration Tag" } });
    await assert.rejects(changeRegister({ kind: "createTag", name: "integration tag" }, maker), /existiert bereits/);
    await changeRegister({ kind: "create", partner: input }, maker);
    let p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    await changeRegister({ kind: "setTags", id: p.id, version: p.version!, tagIds: [successRoom.id, newTag.id] }, maker);
    p = (await readRegister()).partners.find((partner) => partner.id === p.id)!;
    assert.deepEqual(p.tags?.map((tag) => tag.name).sort(), ["Integration Tag", "SuccessRoom"]);
    assert.deepEqual(p.sanctionsLists, ["Test list"]);
    assert.equal(p.decision, "pending"); assert.equal(p.enteredBy, maker.name);
    assert.equal(p.gtsBlockedAt, input.gtsBlockedAt);
    await assert.rejects(changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "approved", comment: "" }, maker), /Vier-Augen/);
    await assert.rejects(changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "declined", comment: "" }, reviewer));
    const pendingVersion = p.version!;
    await changeRegister({ kind: "decide", id: p.id, version: pendingVersion, decision: "approved", comment: "Checked" }, reviewer);
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: pendingVersion, step: "ticketsShn" }, reviewer), /inzwischen geändert/);
    p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    assert.equal(p.completed.suser?.by, "System");
    assert.equal(p.completed.suser?.at, p.decidedAt);
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "rcsc" }, reviewer), /noch nicht freigegeben/);
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "suser" }, reviewer), /noch nicht freigegeben/);
    assert.deepEqual(stepStatuses(p), {
      suser: "done", ticketsShn: "done", rcsc: "done", notify: "done",
      irdp: "running", bcp: "running", scg: "running", cloud: "waiting",
    });
    assert.equal(p.completed.bcp, undefined);
    await db.registerStep.create({ data: { partnerId: p.id, key: "bcp", at: new Date(), by: "System", result: AUTO_RESULT } });
    assert.equal(stepStatuses((await readRegister()).partners.find((partner) => partner.id === p.id)!).bcp, "running");
    await db.registerStep.create({ data: { partnerId: p.id, key: "notify", at: new Date(), by: reviewer.name, result: "SIMULIERT: Test" } });
    assert.equal((await readRegister()).partners.find((p) => p.bpId === bpId)?.completed.notify, undefined);

    const otherBpId = bpId + "-other";
    await changeRegister({ kind: "create", partner: { ...input, bpId: otherBpId } }, maker);
    let other = (await readRegister()).partners.find((partner) => partner.bpId === otherBpId)!;
    await changeRegister({ kind: "decide", id: other.id, version: other.version!, decision: "approved", comment: "" }, reviewer);
    other = (await readRegister()).partners.find((partner) => partner.bpId === otherBpId)!;
    const customers = [p, other].map(({ id, version }) => ({ id, version: version! })).sort((a, b) => a.id.localeCompare(b.id));
    const stale = [customers[0], { ...customers[1], version: customers[1].version - 1 }];
    await assert.rejects(changeRegister({ kind: "confirmNotifications", customers: stale }, reviewer), /inzwischen geändert/);
    assert.equal((await readRegister()).partners.find((partner) => partner.id === customers[0].id)?.completed.notify, undefined);
    await changeRegister({ kind: "confirmNotifications", customers }, reviewer);
    const notified = (await readRegister()).partners.filter((partner) => customers.some(({ id }) => id === partner.id));
    assert.equal(notified.length, 2);
    for (const partner of notified) assert.equal(partner.completed.notify?.result, "E-Mail-Versand bestätigt");
    p = notified.find((partner) => partner.bpId === bpId)!;

    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "scg" }, reviewer), /Ungültiger Sperrschritt/);
    await changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "bcp" }, reviewer);
    p = (await readRegister()).partners.find((partner) => partner.bpId === bpId)!;
    assert.equal(p.completed.bcp?.by, reviewer.name);
    assert.equal(stepStatuses(p).scg, "running");
    assert.equal(stepStatuses(p).cloud, "waiting");
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "cloud" }, reviewer), /noch nicht freigegeben/);
    await changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "irdp" }, reviewer);
    p = (await readRegister()).partners.find((partner) => partner.bpId === bpId)!;
    assert.equal(p.completed.irdp?.by, reviewer.name);
    assert.equal(stepStatuses(p).scg, "done");
    assert.equal(stepStatuses(p).cloud, "running");
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "cloud" }, reviewer), /Cloud-Tenants fehlen/);
    assert.equal(p.audit.length, 7);
    assert.equal(p.decision, "approved");
    await db.registerPartner.update({ where: { id: p.id }, data: {
      tenants: { create: { lob: "Test LoB", product: "Test Product", tenantId: "test-tenant", ticket: "test-ticket" } },
    } });
    await changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "cloud" }, reviewer);
    p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    assert.equal(p.completed.cloud?.by, reviewer.name);
  } finally {
    await db.registerPartner.deleteMany({ where: { bpId: { in: [bpId, bpId + "-other"] } } });
    await db.registerTag.deleteMany({ where: { name: "Integration Tag" } });
    await db.$disconnect();
  }
});
