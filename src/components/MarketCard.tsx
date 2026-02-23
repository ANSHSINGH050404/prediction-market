"use client";

/**
 * src/components/MarketCard.tsx
 *
 * Demo component that wires up usePredictionMath.
 * Shows live price bars and a payout preview for each outcome.
 */

import { useState } from "react";
import { usePredictionMath } from "@/hooks/usePredictionMath";

interface Outcome {
  id: string;
  label: string;
  totalPoints: number;
}

interface MarketCardProps {
  title: string;
  outcomes: Outcome[];
}

export default function MarketCard({ title, outcomes }: MarketCardProps) {
  const [selectedId, setSelectedId] = useState(outcomes[0]?.id ?? "");
  const [stake, setStake] = useState(50);

  const { pricings, payoutLabel, totalPool } = usePredictionMath({
    outcomes,
    selectedOutcomeId: selectedId,
    stake,
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
      <h2 className="mb-4 text-lg font-semibold text-white">{title}</h2>

      {/* Outcome price bars */}
      <div className="mb-4 space-y-3">
        {pricings.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`w-full rounded-xl p-3 text-left transition-all ${
              selectedId === p.id
                ? "bg-indigo-600 ring-2 ring-indigo-400"
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            <div className="mb-1 flex items-center justify-between">
              <span className="font-medium text-white">{p.label}</span>
              <span className="text-sm font-bold text-indigo-200">
                {p.pricePercent}
              </span>
            </div>
            {/* Visual probability bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                style={{ width: p.pricePercent }}
              />
            </div>
            <p className="mt-1 text-xs text-white/60">
              {p.totalPoints.toLocaleString()} pts in pool
            </p>
          </button>
        ))}
      </div>

      {/* Stake input */}
      <div className="mb-3 flex items-center gap-3">
        <label className="text-sm text-white/70">Stake (pts):</label>
        <input
          type="number"
          min={1}
          max={10000}
          value={stake}
          onChange={(e) => setStake(Math.max(1, Number(e.target.value)))}
          className="w-28 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Payout preview */}
      <p className="rounded-xl bg-indigo-950/60 px-4 py-3 text-sm text-indigo-200">
        💡 {payoutLabel}
      </p>

      <p className="mt-3 text-right text-xs text-white/40">
        Total pool: {totalPool.toLocaleString()} pts
      </p>
    </div>
  );
}
