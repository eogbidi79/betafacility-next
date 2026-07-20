import type { NextAuthConfig } from "next-auth";

// Edge-safe base config (no Node-only imports like Prisma/bcrypt). Used by
// middleware and extended in auth.ts with the Credentials provider.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      // User management is admin-only.
      if (path.startsWith("/portal/users")) {
        return auth?.user?.role === "ADMIN";
      }
      if (path.startsWith("/portal")) return Boolean(auth?.user);
      return true;
    },
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role as string | undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
