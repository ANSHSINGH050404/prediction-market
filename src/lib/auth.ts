/**
 * src/lib/auth.ts
 *
 * NextAuth v4 configuration.
 *
 * Providers: Google + GitHub (swap for Facebook / Apple as needed).
 * Adapter:   Prisma — stores sessions & accounts in PostgreSQL.
 * Strategy:  JWT (stateless, no database session table needed).
 *
 * New users automatically receive 0 points and a null lastDailyClaim.
 *
 * Environment variables required (add to .env.local):
 *   NEXTAUTH_SECRET      – random secret for JWT signing
 *   AUTH_GOOGLE_ID       – Google OAuth client ID
 *   AUTH_GOOGLE_SECRET   – Google OAuth client secret
 *   AUTH_GITHUB_ID       – GitHub OAuth client ID
 *   AUTH_GITHUB_SECRET   – GitHub OAuth client secret
 *   NEXTAUTH_URL         – e.g. http://localhost:3000
 */

import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  // @auth/prisma-adapter is compatible with next-auth v4 via the Adapter cast
  adapter: PrismaAdapter(prisma) as Adapter,

  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,

  callbacks: {
    /**
     * Attach the database user ID to the JWT so session.user.id is always
     * available inside Server Actions and API routes.
     */
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },

    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
