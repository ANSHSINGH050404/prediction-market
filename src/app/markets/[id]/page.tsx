import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BettingForm from "@/components/BettingForm";

/**
 * src/app/markets/[id]/page.tsx
 *
 * Market Detail Page — Specific question details and betting interface.
 */

export default async function MarketDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const market = await prisma.market.findUnique({
    where: { id: params.id },
    include: {
      outcomes: {
        orderBy: { label: "asc" },
      },
      resolution: true,
    },
  });

  if (!market) notFound();

  const totalPool = market.outcomes.reduce((acc, o) => acc + o.totalPoints, 0);
  const closesAt = new Date(market.closesAt);
  const isClosed = market.status !== "OPEN" || closesAt < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Market Info */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 mb-6 font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {market.status === "OPEN" ? "Live Market" : "Market Resolved"}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-6 dark:text-white">
              {market.title}
            </h1>
            <p className="text-xl text-zinc-500 leading-relaxed font-medium">
              {market.description}
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Total Volume
              </div>
              <div className="text-2xl font-black">
                {totalPool.toLocaleString()} PTS
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Predictors
              </div>
              <div className="text-2xl font-black">--</div>
            </div>
            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                Closes Date
              </div>
              <div className="text-xl font-bold">
                {closesAt.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* About section or Rules */}
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-2xl font-bold mb-4 italic">Resolution Rules</h3>
            <p className="text-zinc-500 font-medium">
              This market will be resolved by our AI agent based on verified
              news reports available after the closing date. The decision of the
              agent is final and all winnings will be distributed immediately
              upon resolution.
            </p>
          </div>
        </div>

        {/* Right Column: Betting Card */}
        <div className="relative">
          <div className="sticky top-24">
            {isClosed ? (
              <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8 text-center">
                <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Market Closed</h3>
                <p className="text-sm text-zinc-500 font-medium">
                  This market is no longer accepting predictions. Wait for
                  resolution results!
                </p>

                {market.resolution && (
                  <div className="mt-8 p-6 bg-indigo-600 rounded-2xl text-white text-left">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-2 opacity-80">
                      Winning Outcome
                    </span>
                    <span className="text-2xl font-black block mb-4">
                      {
                        market.outcomes.find(
                          (o) => o.id === market.resolution?.winnerId,
                        )?.label
                      }
                    </span>
                    <p className="text-xs font-medium text-indigo-100 leading-relaxed italic border-t border-indigo-500 pt-4">
                      "{market.resolution.reasoning}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <BettingForm outcomes={market.outcomes} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
