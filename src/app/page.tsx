import Link from "next/link";
import MarketCard from "@/components/MarketCard";

// Mock data for initial UI
const featuredMarkets = [
  {
    id: "m1",
    title: "Will Team India win the next T20 series against Australia?",
    category: "Cricket",
    totalPool: 45200,
    endsIn: "4d 12h",
    yesPrice: 0.64,
    noPrice: 0.36,
  },
  {
    id: "m2",
    title: "Will the BSE Sensex cross 85,000 points by end of March?",
    category: "Finance",
    totalPool: 128000,
    endsIn: "24d",
    yesPrice: 0.42,
    noPrice: 0.58,
  },
  {
    id: "m3",
    title: "Will the next major Apple event be announced before Friday?",
    category: "Tech",
    totalPool: 15400,
    endsIn: "2d 4h",
    yesPrice: 0.78,
    noPrice: 0.22,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Now Live in India
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 dark:text-white">
              Predict the Future. <br />
              <span className="text-indigo-600">Win the Game.</span>
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed max-w-2xl">
              India's premier gamified prediction market. Trade on politics,
              sports, and entertainment using virtual points. High stakes, no
              real money.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/markets"
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/30 text-center active:scale-95"
              >
                Browse Markets
              </Link>
              <Link
                href="/how-it-works"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-bold rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-center"
              >
                How it Works
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { label: "Total Points", value: "1.2B+" },
            { label: "Active Predictors", value: "45K+" },
            { label: "Markets Settled", value: "890" },
            { label: "Accuracy Rate", value: "94%" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl"
            >
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Markets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Markets</h2>
            <p className="text-zinc-500 font-medium">
              Trending predictions across India today.
            </p>
          </div>
          <Link
            href="/markets"
            className="text-indigo-600 font-bold hover:underline mb-2"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredMarkets.map((market) => (
            <MarketCard key={market.id} {...market} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-indigo-600 rounded-[32px] p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              Ready to make your first move?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of other Indians predicting real-world events.
              Claim your daily 100 points and start climbing the leaderboard.
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-10 py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-zinc-100 transition-all shadow-xl active:scale-95"
            >
              Get Started for Free
            </Link>
          </div>

          {/* Abstract circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-400/20 rounded-full blur-2xl" />
        </div>
      </section>
    </div>
  );
}
