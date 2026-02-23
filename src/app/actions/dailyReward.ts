"use server";

/**
 * src/app/actions/dailyReward.ts
 *
 * Next.js 14 Server Action — Daily Reward Claim
 * -----------------------------------------------
 * Rules:
 *  • A user may claim 100 points once every calendar day (UTC midnight resets).
 *  • Each consecutive-day claim increments `streakCount`.
 *  • Missing a day resets the streak back to 1.
 *
 * Returns a typed result union so the client can render the correct UI state.
 */

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ── Constants ────────────────────────────────────────────────────────────────

const DAILY_POINTS = 100;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// ── Types ────────────────────────────────────────────────────────────────────

export type ClaimResult =
  | {
      success: true;
      pointsAwarded: number;
      newBalance: number;
      newStreak: number;
      /** ISO string of the next claimable time */
      nextClaimAt: string;
    }
  | {
      success: false;
      alreadyClaimed: boolean;
      /** ISO string of the next claimable time (only present when alreadyClaimed) */
      nextClaimAt?: string;
      error?: string;
    };

// ── Helper: strip time component, compare dates by UTC day ───────────────────

function toUTCDay(date: Date): string {
  return date.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function startOfNextUTCDay(from: Date): Date {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Server Action ─────────────────────────────────────────────────────────────

export async function claimDailyReward(): Promise<ClaimResult> {
  // 1. Authenticate
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, alreadyClaimed: false, error: "Unauthenticated" };
  }

  const userId = session.user.id;
  const now = new Date();
  const todayKey = toUTCDay(now);

  // 2. Load user — only the fields we need
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { points: true, streakCount: true, lastDailyClaim: true },
  });

  if (!user) {
    return { success: false, alreadyClaimed: false, error: "User not found" };
  }

  // 3. Guard: already claimed today?
  if (user.lastDailyClaim && toUTCDay(user.lastDailyClaim) === todayKey) {
    return {
      success: false,
      alreadyClaimed: true,
      nextClaimAt: startOfNextUTCDay(now).toISOString(),
    };
  }

  // 4. Calculate new streak
  let newStreak = 1; // default: start fresh

  if (user.lastDailyClaim) {
    const lastKey = toUTCDay(user.lastDailyClaim);
    const yesterday = toUTCDay(new Date(now.getTime() - MS_PER_DAY));

    if (lastKey === yesterday) {
      // Claimed yesterday — keep the streak going
      newStreak = user.streakCount + 1;
    }
    // else: the user missed a day — streak resets to 1 (already set above)
  }

  // 5. Atomically update the user record
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      points: { increment: DAILY_POINTS },
      streakCount: newStreak,
      lastDailyClaim: now,
    },
    select: { points: true, streakCount: true },
  });

  return {
    success: true,
    pointsAwarded: DAILY_POINTS,
    newBalance: updatedUser.points,
    newStreak: updatedUser.streakCount,
    nextClaimAt: startOfNextUTCDay(now).toISOString(),
  };
}
