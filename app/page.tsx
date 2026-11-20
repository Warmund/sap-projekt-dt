import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { canEditWorkspace, workspaceRole } from "../lib/roles";
import { readRegister } from "../lib/register/repository";
import { Shell } from "./shell";
import { WorkspaceLoading } from "./workspace-loading";
import { readWorkspaceView, type WorkspaceView } from "./workspace-view";

type Params = Record<string, string | string[] | undefined>;

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const params = await searchParams;
  const user = { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.role ?? "user" };
  const requested = readWorkspaceView(params.view);
  const view = requested === "rg-new" && !canEditWorkspace(workspaceRole(user.role)) ? "rg-dashboard" : requested;
  const partnerId = view === "rg-detail" && typeof params.case === "string" ? params.case : undefined;
  return <Suspense fallback={<WorkspaceLoading />}>
    <Workspace user={user} view={view} partnerId={partnerId} />
  </Suspense>;
}

async function Workspace({ user, view, partnerId }: {
  user: { id: string; name: string; email: string; role: string };
  view: WorkspaceView;
  partnerId?: string;
}) {
  const register = await readRegister();
  const validDetail = view !== "rg-detail" || register.partners.some((partner) => partner.id === partnerId);
  return <Shell initialRegister={register} user={user}
    initialView={validDetail ? view : "rg-register"} initialPartnerId={validDetail ? partnerId : undefined} />;
}
