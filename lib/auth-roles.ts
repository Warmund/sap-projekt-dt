import { adminAc, userAc } from "better-auth/plugins/admin/access";

export const authRoles = {
  "export-control": adminAc,
  "display-only": userAc,
  scg: userAc,
  admin: adminAc,
  user: userAc,
};
