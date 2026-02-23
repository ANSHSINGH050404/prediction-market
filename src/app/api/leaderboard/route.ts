/**
 * src/app/api/leaderboard/route.ts
 *
 * Leaderboard API — GET /api/leaderboard
 * ----------------------------------------
 * Returns the top 10 users ranked by total virtual points.
 *
 * Performance optimisations
 * ──────────────────────────
 * 1.  Prisma query uses `orderBy` on the `points` field, which is backed
 *     by a B-tree index defined in schema.prisma: @@index([points])
 * 2.  `take: 10` — Prisma translates this to `LIMIT 10`, so the DB never
 *     loads more rows than needed.
 * 3.  `select` — we only pull the columns we actually need, minimising
 *     row-size and serialisation overhead.
 * 4.  `unstable_cache` (Next.js Data Cache) — caches the query result for
 *     60 seconds so repeated page loads never hit the DB.
 *     Tagged with "leaderboard" so it can be invalidated via revalidateTag()
 *     when a bet is settled or a daily reward is claimed.
 *
 * Usage:
 *   fetch("/api/leaderboard")
 *   // → { users: [{ rank, id, name, image, points, streakCount }, ...] }
 */

import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  streakCount: number;
}

// ── Cached Prisma query ───────────────────────────────────────────────────────

/**
 * `fetchTopUsers` is wrapped in Next.js data cache.
 * TTL = 60 seconds; invalidate with: revalidateTag("leaderboard")
 */
const fetchTopUsers = unstable_cache(
  async (): Promise<LeaderboardEntry[]> => {
    const users = await prisma.user.findMany({
      orderBy: { points: "desc" }, // uses the @@index([points]) B-tree
      take: 10, // LIMIT 10 — never scans the full table
      select: {
        id: true,
        name: true,
        image: true,
        points: true,
        streakCount: true,
      },
    });

    // Attach 1-based rank
    return users.map((u, i) => ({ rank: i + 1, ...u }));
  },
  ["leaderboard-top10"], // cache key
  {
    revalidate: 60, // seconds
    tags: ["leaderboard"], // allows on-demand invalidation
  },
);

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const users = await fetchTopUsers();
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("[leaderboard] query failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}
