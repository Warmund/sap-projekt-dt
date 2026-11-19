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
    stepOrder: "A", id: "ignored-client-id", bpId, erpId: "test-erp", name: "Integration fixture", country: "Test", ets: "ETS3",
    gtsBlockedAt: "2026-11-17T12:34:56.000Z", enteredBy: "Untrusted client", sanctionsList: "Test list", decision: "approved",
    cloudCustomer: true, tenants: [], specialCategory: null, comment: "Temporary integration fixture", completed: {}, audit: [],
  };
  try {
    await changeRegister({ kind: "create", partner: input }, maker);
    let p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    assert.equal(p.decision, "pending"); assert.equal(p.enteredBy, maker.name);
    assert.equal(p.gtsBlockedAt, input.gtsBlockedAt);
    await assert.rejects(changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "approved", comment: "" }, maker), /Vier-Augen/);
    await assert.rejects(changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "declined", comment: "" }, reviewer));
    assert.equal(p.stepOrder, "A");
    await changeRegister({ kind: "setStepOrder", id: p.id, version: p.version!, stepOrder: "B" }, maker);
    await assert.rejects(changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "approved", comment: "" }, reviewer), /inzwischen geändert/);
    p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    assert.equal(p.stepOrder, "B");
    await changeRegister({ kind: "decide", id: p.id, version: p.version!, decision: "approved", comment: "Checked" }, reviewer);
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "suser" }, reviewer), /inzwischen geändert/);
    p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "remote" }, reviewer), /noch nicht freigegeben/);
    await assert.rejects(changeRegister({ kind: "setStepOrder", id: p.id, version: p.version!, stepOrder: "A" }, reviewer), /festgelegt/);
    const outOfOrder = { kind: "complete" as const, id: p.id, version: p.version!, step: "suser" as const, variant: "A" };
    await assert.rejects(changeRegister(outOfOrder, reviewer), /noch nicht freigegeben/);
    for (const step of ["tickets", "remote", "suser"] as const) {
      await changeRegister({ kind: "complete", id: p.id, version: p.version!, step, result: "Confirmed by test" }, reviewer);
      p = (await readRegister()).partners.find((p) => p.bpId === bpId)!;
      assert.equal(p.completed[step]?.by, reviewer.name);
    }
    await assert.rejects(changeRegister({ kind: "complete", id: p.id, version: p.version!, step: "cloud" }, reviewer), /Cloud-Tenants fehlen/);
    assert.equal(p.audit.length, 6);
    assert.equal(p.decision, "approved");
  } finally {
    await db.registerPartner.deleteMany({ where: { bpId } });
    await db.$disconnect();
  }
});
