"use client";

import { useEffect, useState } from "react";

interface User {
  rank: number;
  id: string;
  name: string | null;
  image: string | null;
  points: number;
  streakCount: number;
}

export default function LeaderboardTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 w-full bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-[24px] bg-white dark:bg-zinc-900 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-zinc-50 dark:bg-black/20 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              Rank
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              User
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">
              Streak
            </th>
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">
              Points
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
            >
              <td className="px-6 py-6">
                <span
                  className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-black text-sm
                  ${
                    user.rank === 1
                      ? "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/20"
                      : user.rank === 2
                        ? "bg-zinc-300 text-zinc-800"
                        : user.rank === 3
                          ? "bg-orange-300 text-orange-900"
                          : "text-zinc-500 dark:text-zinc-400"
                  }
                `}
                >
                  {user.rank}
                </span>
              </td>
              <td className="px-6 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-100">
                    <img
                      src={
                        user.image ||
                        `https://ui-avatars.com/api/?name=${user.name || "User"}`
                      }
                      alt={user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-zinc-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {user.name || "Anonymous Predictor"}
                    </div>
                    <div className="text-xs text-zinc-500">
                      Member since Feb 2026
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <div className="flex items-center justify-end gap-1.5 font-bold text-orange-500">
                  <span>🔥</span>
                  <span>{user.streakCount}d</span>
                </div>
              </td>
              <td className="px-6 py-6 text-right">
                <div className="font-black text-lg text-zinc-900 dark:text-zinc-100">
                  {user.points.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                  Points
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
