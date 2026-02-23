import { prisma } from "@/lib/prisma";
import MarketCard from "@/components/MarketCard";
import Link from "next/link";

/**
 * src/app/markets/page.tsx
 *
 * All Markets Page — Grid of open and closed prediction markets.
 */

export default async function MarketsPage() {
  const markets = await prisma.market.findMany({
    include: {
      outcomes: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-3 dark:text-white">
            Explore <span className="text-indigo-600">Markets</span>
          </h1>
          <p className="text-zinc-500 font-medium">
            Find the latest predictions across India. Sports, Tech, Finance and
            more.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold">
            All Categories
          </div>
          <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20">
            Open Only
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {markets.map((market) => {
          // Calculate Yes/No prices for the card
          const totalPts =
            market.outcomes.reduce((acc, o) => acc + o.totalPoints, 0) || 2;
          const yesOutcome =
            market.outcomes.find((o) => o.label === "Yes") ||
            market.outcomes[0];
          const noOutcome =
            market.outcomes.find((o) => o.label === "No") || market.outcomes[1];

          // Simplified price calc: P(Yes) = totalNo / (totalYes + totalNo)
          const yesPrice =
            totalPts > 0 ? (totalPts - yesOutcome.totalPoints) / totalPts : 0.5;
          const noPrice =
            totalPts > 0 ? (totalPts - noOutcome.totalPoints) / totalPts : 0.5;

          // Time left text
          const now = new Date();
          const closes = new Date(market.closesAt);
          const diffMs = closes.getTime() - now.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const endsInText =
            diffDays > 0
              ? `${diffDays}d`
              : diffDays === 0
                ? "Ends Today"
                : "Closed";

          return (
            <MarketCard
              key={market.id}
              id={market.id}
              title={market.title}
              category={market.id.startsWith("m") ? "Featured" : "General"} // Or use a category field if added
              totalPool={totalPts}
              endsIn={endsInText}
              yesPrice={yesPrice}
              noPrice={noPrice}
            />
          );
        })}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-24 bg-zinc-50 dark:bg-zinc-900/50 rounded-[32px] border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 font-bold">
            No markets found. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
