import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import { auth } from "./auth";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  changeEmail,
  changePassword,
  sendVerificationEmail,
  updateUser,
} = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
});
