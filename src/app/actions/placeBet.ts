"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

/**
 * src/app/actions/placeBet.ts
 *
 * Server Action to place a bet on a market outcome.
 */

export type BetResult =
  | { success: true; newBalance: number }
  | { success: false; error: string };

export async function placeBet(
  outcomeId: string,
  amount: number,
): Promise<BetResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { success: false, error: "Unauthenticated" };
  }

  if (amount <= 0) {
    return { success: false, error: "Amount must be greater than zero" };
  }

  const userId = session.user.id;

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Get user balance and check if they have enough points
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user) throw new Error("User not found");
      if (user.points < amount) throw new Error("Insufficient points");

      // 2. Get the outcome to make sure it exists and get its market
      const outcome = await tx.outcome.findUnique({
        where: { id: outcomeId },
        include: { market: true },
      });

      if (!outcome) throw new Error("Outcome not found");
      if (outcome.market.status !== "OPEN") throw new Error("Market is closed");
      if (new Date() > outcome.market.closesAt)
        throw new Error("Market has expired");

      // 3. Deduct points from user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: amount } },
      });

      // 4. Increment points in outcome
      await tx.outcome.update({
        where: { id: outcomeId },
        data: { totalPoints: { increment: amount } },
      });

      // 5. Create the bet record
      await tx.bet.create({
        data: {
          userId,
          outcomeId,
          points: amount,
        },
      });

      // Invalidate leaderboard cache since points changed
      revalidateTag("leaderboard");

      return { success: true, newBalance: updatedUser.points };
    });
  } catch (err: any) {
    console.error("[placeBet] error:", err.message);
    return { success: false, error: err.message || "Failed to place bet" };
  }
}
