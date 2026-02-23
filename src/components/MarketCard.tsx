import Link from "next/link";

interface MarketCardProps {
  id: string;
  title: string;
  category: string;
  totalPool: number;
  endsIn: string;
  yesPrice: number;
  noPrice: number;
}

export default function MarketCard({
  id,
  title,
  category,
  totalPool,
  endsIn,
  yesPrice,
  noPrice,
}: MarketCardProps) {
  return (
    <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-md">
          {category}
        </span>
        <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          {endsIn}
        </span>
      </div>

      <Link href={`/markets/${id}`} className="block mb-6">
        <h3 className="text-lg font-bold leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
      </Link>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
          <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
            Yes
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-white">
            {(yesPrice * 100).toFixed(0)}%
          </div>
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${yesPrice * 100}%` }}
            />
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-3 border border-zinc-100 dark:border-zinc-800">
          <div className="text-[10px] font-bold uppercase text-zinc-400 mb-1">
            No
          </div>
          <div className="text-xl font-black text-zinc-900 dark:text-white">
            {(noPrice * 100).toFixed(0)}%
          </div>
          <div className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-red-500"
              style={{ width: `${noPrice * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-zinc-400">
            Pool
          </span>
          <span className="text-sm font-bold">
            {totalPool.toLocaleString()} PTS
          </span>
        </div>
        <Link
          href={`/markets/${id}`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 shadow-md shadow-indigo-600/20"
        >
          Predict Now
        </Link>
      </div>
    </div>
  );
}
