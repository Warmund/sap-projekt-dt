import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient } from "better-auth/client/plugins";

import { authRoles } from "./auth-roles";

export const authClient = createAuthClient({ plugins: [usernameClient(), adminClient({ roles: authRoles })] });
