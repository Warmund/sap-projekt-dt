import "dotenv/config";
import { betterAuth } from "better-auth";
import { auth } from "../lib/auth";

const [username, email, name, password] = [process.env.DEMO_USERNAME, process.env.DEMO_EMAIL, process.env.DEMO_NAME, process.env.DEMO_PASSWORD];
if (!username || !email || !name || !password) {
  throw new Error("DEMO_USERNAME, DEMO_EMAIL, DEMO_NAME und DEMO_PASSWORD müssen gesetzt sein.");
}

async function main() {
  const provisioner = betterAuth({ ...auth.options, emailAndPassword: { ...auth.options.emailAndPassword, enabled: true, disableSignUp: false } });
  await provisioner.api.signUpEmail({ body: { username: username!, email: email!, name: name!, password: password! } });
  console.log("Demo-Zugang wurde angelegt.");
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
