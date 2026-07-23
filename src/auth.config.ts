import type { NextAuthConfig } from "next-auth";
import { routeAllowed } from "@/lib/rbac";

// Edge-safe base config (no Node-only imports like Prisma/bcrypt). Used by
// middleware and extended in auth.ts with the Credentials provider.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      // Route gating is defined centrally in rbac.ts and re-checked server-side.
      return routeAllowed(request.nextUrl.pathname, auth?.user?.role);
    },
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.country = (user as { country?: string | null }).country ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
        session.user.country = (token.country as string | null | undefined) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
