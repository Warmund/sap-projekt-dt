"use server";
import { headers } from "next/headers";
import { auth } from "../../lib/auth";
import { changeRegister, readRegister, RegisterError, type RegisterCommand } from "../../lib/register/repository";

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new RegisterError("Bitte erneut anmelden.");
  return session.user;
}

export async function loadRegister() {
  await requireUser();
  return readRegister();
}

export async function mutateRegister(command: RegisterCommand) {
  try {
    const user = await requireUser();
    // The MVP has no agreed EC/team roles yet: authenticated project users may edit the register.
    await changeRegister(command, { id: user.id, name: user.name });
    return { data: await readRegister() };
  } catch (error) {
    const message = error instanceof RegisterError
      ? error.message : "Speichern fehlgeschlagen. Bitte neu laden und erneut versuchen.";
    return { error: message };
  }
}
