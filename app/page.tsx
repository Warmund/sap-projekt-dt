import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../lib/auth";
import { Shell } from "./shell";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return <Shell userId={session.user.id} />;
}
