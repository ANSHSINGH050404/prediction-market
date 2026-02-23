"use client";

import { useState } from "react";
import { usePredictionMath } from "@/hooks/usePredictionMath";
import { placeBet } from "@/app/actions/placeBet";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface BettingFormProps {
  outcomes: Array<{ id: string; label: string; totalPoints: number }>;
}

export default function BettingForm({ outcomes }: BettingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(outcomes[0].id);
  const [stake, setStake] = useState(100);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const { pricings, potentialPayout, payoutLabel } = usePredictionMath({
    outcomes,
    selectedOutcomeId: selectedId,
    stake,
  });

  const handlePredict = async () => {
    if (!session) {
      setMessage({ type: "error", text: "Please sign in to place a bet." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await placeBet(selectedId, stake);

    if (result.success) {
      setMessage({ type: "success", text: "Prediction placed successfully!" });
      router.refresh(); // Refresh balance and data
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setLoading(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 shadow-xl shadow-indigo-500/5">
      <h3 className="text-xl font-bold mb-6">Take your position</h3>

      {/* Outcome Selection */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {pricings.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={`flex flex-col p-4 rounded-2xl border-2 transition-all ${
              selectedId === p.id
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
            }`}
          >
            <span className="text-xs font-bold text-zinc-400 uppercase mb-1">
              {p.label}
            </span>
            <span className="text-2xl font-black">{p.pricePercent}</span>
          </button>
        ))}
      </div>

      {/* Stake Input */}
      <div className="mb-8">
        <label className="block text-xs font-bold text-zinc-400 uppercase mb-3 px-1">
          Amount to wager (PTS)
        </label>
        <div className="relative">
          <input
            type="number"
            min="10"
            value={stake}
            onChange={(e) => setStake(parseInt(e.target.value) || 0)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 text-xl font-bold focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
            {[50, 100, 250].map((val) => (
              <button
                key={val}
                onClick={() => setStake(val)}
                className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold hover:bg-zinc-50 transition-colors"
              >
                +{val}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payout Preview */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-4 mb-8">
        <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300 leading-relaxed">
          {payoutLabel}
        </p>
      </div>

      <button
        onClick={handlePredict}
        disabled={loading || stake <= 0}
        className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/30 active:scale-[0.98]"
      >
        {loading ? "Placing Prediction..." : "Confirm Prediction"}
      </button>

      {message && (
        <div
          className={`mt-4 p-4 rounded-xl text-sm font-bold text-center ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
