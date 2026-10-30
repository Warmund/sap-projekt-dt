import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, username } from "better-auth/plugins";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  disabledPaths: ["/is-username-available"],
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/admin/create-user") return;
      const body = context.body;
      if (typeof body?.password !== "string" || body.password.length < 8 ||
          typeof body.data?.username !== "string" || !/^[a-zA-Z0-9_.]{3,30}$/.test(body.data.username) ||
          (body.role !== "user" && body.role !== "admin")) {
        throw new APIError("BAD_REQUEST", { message: "Ungültige Nutzerdaten" });
      }
    }),
  },
  plugins: [username(), admin()],
  rateLimit: { enabled: true, storage: "database", customRules: { "/sign-in/username": { window: 60, max: 5 } } },
});
