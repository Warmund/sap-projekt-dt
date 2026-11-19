import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { readRegister } from "../lib/register/repository";
import { Shell } from "./shell";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const register = await readRegister();
  return <Shell initialRegister={register} user={{ name: session.user.name, email: session.user.email, role: session.user.role ?? "user" }} />;
}
