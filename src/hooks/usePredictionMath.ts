/**
 * src/hooks/usePredictionMath.ts
 *
 * Custom React hook — Prediction Market Math
 * ------------------------------------------
 * Implements a simple Constant-Product Market Maker (CPMM) model,
 * analogous to Uniswap's x·y = k, adapted for Yes/No outcomes:
 *
 *   Price of Yes  = totalNo  / (totalYes + totalNo)
 *   Price of No   = totalYes / (totalYes + totalNo)
 *
 * These prices always sum to 1 (i.e. 100 %), which is the core invariant
 * of a binary prediction market.
 *
 * Payout calculation uses a simplified model:
 *   potentialWin = stake * (1 / price)
 *
 * Both outputs are memoised — the hook re-computes only when the inputs change.
 */

import { useMemo } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PredictionOutcome {
  id: string;
  label: string; // e.g. "Yes" | "No"
  totalPoints: number; // points already wagered on this outcome
}

export interface UsePredictionMathOptions {
  /** The two (or more) outcomes. For binary markets pass exactly two. */
  outcomes: PredictionOutcome[];
  /**
   * The outcome ID the prospective bettor is interested in.
   * Used for the payout calculation.
   */
  selectedOutcomeId: string;
  /** How many points the user intends to wager (default: 50) */
  stake?: number;
}

export interface OutcomePricing {
  id: string;
  label: string;
  /** Implied probability (0 – 1) rounded to 4 decimal places */
  price: number;
  /** Same as price but displayed as a percentage string e.g. "63.41%" */
  pricePercent: string;
  totalPoints: number;
}

export interface PredictionMathResult {
  /** Price data for every outcome in the market */
  pricings: OutcomePricing[];
  /** Implied price (0 – 1) of the user's selected outcome */
  selectedPrice: number;
  /**
   * Estimated payout if the user wins their bet.
   * Net profit = potentialPayout - stake
   */
  potentialPayout: number;
  /** Human-readable summary e.g. "If you bet 50 pts on Yes, you win 120 pts" */
  payoutLabel: string;
  /** Total points in the pool across all outcomes */
  totalPool: number;
}

// ── Tiny guard: avoid division-by-zero when the pool is empty ─────────────────
const EPSILON = 1; // treat an empty pool as if 1 pt is on each side

// ── Hook implementation ───────────────────────────────────────────────────────

export function usePredictionMath({
  outcomes,
  selectedOutcomeId,
  stake = 50,
}: UsePredictionMathOptions): PredictionMathResult {
  return useMemo(() => {
    // ── 1. Total pool across all outcomes ─────────────────────────────────────
    const rawTotal = outcomes.reduce((acc, o) => acc + o.totalPoints, 0);
    const total = rawTotal === 0 ? outcomes.length * EPSILON : rawTotal;

    // ── 2. Price for each outcome ─────────────────────────────────────────────
    //
    // For a binary (Yes/No) market:
    //   P(Yes) = totalNo / (totalYes + totalNo)
    //            ≡ (total - totalYes) / total
    //
    // Generalised for N outcomes using the "leave-one-out" approach so all
    // prices still approximately sum to 1:
    //   P(outcome_i) = (total - points_i) / (total * (N - 1))
    //
    // Special case for N=2 this reduces exactly to the standard formula.

    const N = outcomes.length;

    const pricings: OutcomePricing[] = outcomes.map((o) => {
      const pts = rawTotal === 0 ? EPSILON : o.totalPoints || EPSILON;
      const price =
        N === 1
          ? 1 // trivial market
          : (total - pts) / (total * (N - 1));

      const clampedPrice = Math.min(Math.max(price, 0.0001), 0.9999);

      return {
        id: o.id,
        label: o.label,
        price: parseFloat(clampedPrice.toFixed(4)),
        pricePercent: `${(clampedPrice * 100).toFixed(2)}%`,
        totalPoints: o.totalPoints,
      };
    });

    // ── 3. Selected outcome pricing ───────────────────────────────────────────
    const selected =
      pricings.find((p) => p.id === selectedOutcomeId) ?? pricings[0];
    const selectedPrice = selected?.price ?? 0.5;

    // ── 4. Potential payout ───────────────────────────────────────────────────
    //
    // Standard AMM payout: stake / price
    //   • If price = 0.5  → payout = 100 pts (50 % chance → 2× multiplier)
    //   • If price = 0.25 → payout = 200 pts (25 % chance → 4× multiplier)

    const potentialPayout = Math.round(stake / selectedPrice);
    const netProfit = potentialPayout - stake;

    const payoutLabel =
      `If you bet ${stake} pts on "${selected?.label}", ` +
      `you could win ${potentialPayout} pts (+${netProfit} pts profit)`;

    return {
      pricings,
      selectedPrice,
      potentialPayout,
      payoutLabel,
      totalPool: rawTotal,
    };
  }, [outcomes, selectedOutcomeId, stake]);
}
