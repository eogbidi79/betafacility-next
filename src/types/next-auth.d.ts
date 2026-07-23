import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    country?: string | null;
  }
  interface Session {
    user: {
      role?: string;
      country?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    country?: string | null;
  }
}
