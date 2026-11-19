// Runs under tsx because Playwright's CommonJS transformer cannot load Prisma's import.meta.
import { betterAuth } from "better-auth";
import { auth } from "../../lib/auth";
import { db } from "../../lib/db";

async function main() {
  const username = process.env.REGISTER_SMOKE_USERNAME;
  const password = process.env.REGISTER_SMOKE_PASSWORD;
  if (!username?.startsWith("smoke_") || !password) throw new Error("Missing smoke test configuration.");
  const email = `${username}@example.invalid`;
  if (process.argv[2] === "cleanup") {
    await db.user.deleteMany({ where: { email } });
  } else {
    const provisioner = betterAuth({ ...auth.options, emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false } });
    await provisioner.api.signUpEmail({ body: { username, email, name: "Register smoke test", password } });
    const partner = await db.registerPartner.findFirstOrThrow({ where: { sourceFile: { not: null }, cloudCustomer: true }, select: { bpId: true, name: true, region: true } });
    console.log(JSON.stringify({ partner, count: await db.registerPartner.count(), sr: await db.registerPartner.count({ where: { specialCategory: "SR" } }), cloudMissing: await db.registerPartner.count({ where: { cloudCustomer: true, tenants: { none: {} } } }) }));
  }
}
main().catch(() => { console.error("Register smoke fixture failed."); process.exitCode = 1; }).finally(() => db.$disconnect());
