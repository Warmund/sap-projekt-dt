import type { AdministrationView } from "./administration";
import type { RegisterView } from "./_register/store";

export type WorkspaceView = AdministrationView | RegisterView | "settings";

const VIEWS: readonly WorkspaceView[] = [
  "rg-dashboard", "rg-register", "rg-new", "rg-detail", "rg-tasks", "rg-contacts",
  "rg-notifications", "admin-imports", "admin-cloud", "users", "settings",
];

export function readWorkspaceView(value: unknown): WorkspaceView {
  return VIEWS.find((view) => view === value) ?? "rg-dashboard";
}
