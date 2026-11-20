import assert from "node:assert/strict";
import { test } from "node:test";
import { canMutateRegister, workspaceRole } from "../roles";
import type { RegisterCommand } from "./repository";
import { MOCK_PARTNERS, mockContacts } from "./mock-data";

test("only Export Kontrolle can edit the workspace and SCG can confirm only IRDP and BCP", () => {
  const record = { id: "partner", version: 1 };
  const allowedForScg: RegisterCommand[] = [
    { kind: "complete", ...record, step: "irdp" },
    { kind: "complete", ...record, step: "bcp" },
  ];
  const adminOnly: RegisterCommand[] = [
    { kind: "complete", ...record, step: "scg" },
    { kind: "complete", ...record, step: "cloud" },
    { kind: "complete", ...record, step: "notify" },
    { kind: "complete", ...record, step: "rcsc" },
    { kind: "decide", ...record, decision: "approved", comment: "" },
    { kind: "createFromGts", bpId: "1000611", tagIds: [], sanctionsLists: ["EU"] },
    { kind: "createTag", name: "Example" },
    { kind: "setTags", ...record, tagIds: [] },
    { kind: "create", partner: MOCK_PARTNERS[0] },
    { kind: "contact", contact: mockContacts()[0] },
    { kind: "confirmNotifications", customers: [record] },
  ];
  for (const command of [...allowedForScg, ...adminOnly]) {
    assert.equal(canMutateRegister(workspaceRole("admin"), command), true);
    assert.equal(canMutateRegister(workspaceRole("export-control"), command), true);
    for (const role of ["display-only", "user", "unknown", null]) {
      assert.equal(canMutateRegister(workspaceRole(role), command), false);
    }
  }
  for (const command of allowedForScg) assert.equal(canMutateRegister("scg", command), true);
  for (const command of adminOnly) assert.equal(canMutateRegister("scg", command), false);
});
