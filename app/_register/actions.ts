"use server";
import { headers } from "next/headers";
import { canMutateRegister, workspaceRole } from "../../lib/roles";
import { db } from "../../lib/db";
import { auth } from "../../lib/auth";
import { changeRegister, readRegister, RegisterError, type RegisterCommand } from "../../lib/register/repository";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers(), query: { disableCookieCache: true } });
  if (!session) throw new RegisterError("Bitte erneut anmelden.");
  return session.user;
}

export async function loadRegister() {
  await requireUser();
  return readRegister();
}

export async function listWorkspaceUsers() {
  await requireUser();
  return db.user.findMany({
    select: { id: true, name: true, email: true, username: true, role: true },
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
}

export async function mutateRegister(command: RegisterCommand) {
  try {
    const user = await requireUser();
    if (!canMutateRegister(workspaceRole(user.role), command)) {
      throw new RegisterError("Deine Gruppe hat keine Berechtigung für diese Aktion.");
    }
    await changeRegister(command, { id: user.id, name: user.name });
    return { data: await readRegister() };
  } catch (error) {
    const message = error instanceof RegisterError
      ? error.message : "Speichern fehlgeschlagen. Bitte neu laden und erneut versuchen.";
    return { error: message };
  }
}
