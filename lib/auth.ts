import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, username } from "better-auth/plugins";
import { authRoles } from "./auth-roles";
import { isWorkspaceRole } from "./roles";
import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, disableSignUp: true },
  disabledPaths: ["/is-username-available"],
  hooks: {
    before: createAuthMiddleware(async (context) => {
      if (context.path !== "/admin/create-user") return;
      const body = context.body;
      if (typeof body?.password !== "string" || body.password.length < 8 ||
          typeof body.data?.username !== "string" || !/^[a-zA-Z0-9_.]{3,30}$/.test(body.data.username) ||
          !isWorkspaceRole(body.role)) {
        throw new APIError("BAD_REQUEST", { message: "Ungültige Nutzerdaten" });
      }
    }),
  },
  plugins: [username(), admin({ roles: authRoles, defaultRole: "display-only", adminRoles: ["export-control", "admin"] })],
  rateLimit: { enabled: true, storage: "database", customRules: { "/sign-in/username": { window: 60, max: 5 } } },
});
