// src/app/api/auth/[...nextauth]/route.ts
// Delegates all NextAuth requests to the central auth configuration (v4).
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
