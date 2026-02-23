// src/app/api/auth/[...nextauth]/route.ts
// Delegates all NextAuth requests to the central auth configuration.
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
