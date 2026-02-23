import LeaderboardTable from "@/components/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-3xl mb-16">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 dark:text-white">
          Hall of <span className="text-indigo-600">Fame</span>
        </h1>
        <p className="text-lg text-zinc-500 font-medium">
          The top 10 predictors in India. Climb the ranks by making accurate
          predictions and keeping your streak alive.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2">
          <LeaderboardTable />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[32px] p-8 text-white relative overflow-hidden">
            <h3 className="text-2xl font-bold mb-4">Wanna be #1?</h3>
            <p className="text-indigo-100 font-medium mb-6">
              Consistency is key. Claim your daily reward every 24 hours to
              boost your streak and get fresh points for your next big
              prediction.
            </p>
            <button className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl hover:bg-zinc-100 transition-colors shadow-lg">
              Claim Daily Reward
            </button>
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-xl" />
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[32px] p-8">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <span className="text-indigo-600 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-xs">
                TIP
              </span>
              How it works
            </h4>
            <ul className="space-y-4">
              {[
                {
                  title: "Win Predictions",
                  desc: "Correct outcome = Multiplied points",
                },
                {
                  title: "Daily Claims",
                  desc: "Get 100 points every single day",
                },
                {
                  title: "Maintain Streaks",
                  desc: "Climb higher with consecutive claims",
                },
              ].map((item, i) => (
                <li key={i} className="flex flex-col">
                  <span className="font-bold text-sm">{item.title}</span>
                  <span className="text-xs text-zinc-500">{item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
