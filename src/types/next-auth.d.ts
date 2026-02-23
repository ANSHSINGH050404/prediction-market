/**
 * src/types/next-auth.d.ts
 *
 * Extends the default next-auth v4 Session types to include
 * the database user `id` field that we attach in the JWT + session callbacks.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
