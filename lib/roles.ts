import type { RegisterCommand } from "./register/repository";
import { SCG_STEPS } from "./register/workflow";

export const ROLE_LABELS = {
  "export-control": "Export Kontrolle",
  "display-only": "Display only",
  scg: "SCG (Support Compliance Group)",
} as const;

export type WorkspaceRole = keyof typeof ROLE_LABELS;

export function isWorkspaceRole(value: unknown): value is WorkspaceRole {
  return typeof value === "string" && Object.hasOwn(ROLE_LABELS, value);
}

export function workspaceRole(value: string | null | undefined): WorkspaceRole {
  const roles = value?.split(",") ?? [];
  if (roles.includes("export-control") || roles.includes("admin")) return "export-control";
  if (roles.includes("scg")) return "scg";
  return "display-only";
}

export function canEditWorkspace(role: WorkspaceRole) {
  return role === "export-control";
}

export function canCompleteStep(role: WorkspaceRole, step: unknown) {
  return canEditWorkspace(role) || (role === "scg" && SCG_STEPS.some((allowed) => allowed === step));
}

export function canMutateRegister(role: WorkspaceRole, command: RegisterCommand) {
  return canEditWorkspace(role) || (command?.kind === "complete" && canCompleteStep(role, command.step));
}
