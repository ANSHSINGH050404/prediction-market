"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Predict<span className="text-indigo-600">IN</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/markets"
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
              >
                Markets
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
            ) : session ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Balance
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    1,250 PTS
                  </span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="relative w-10 h-10 rounded-full border-2 border-indigo-600/20 overflow-hidden hover:border-indigo-600 transition-colors"
                >
                  <img
                    src={
                      session.user?.image ||
                      `https://ui-avatars.com/api/?name=${session.user?.name}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </button>
                <button
                  onClick={() => signOut()}
                  className="hidden md:block text-sm font-medium text-zinc-600 hover:text-red-500 dark:text-zinc-400 transition-colors"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu (simplified) */}
      {isMenuOpen && session && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex flex-col gap-4">
            <Link href="/markets" className="text-lg font-medium">
              Markets
            </Link>
            <Link href="/leaderboard" className="text-lg font-medium">
              Leaderboard
            </Link>
            <hr className="border-zinc-100 dark:border-zinc-900" />
            <button
              onClick={() => signOut()}
              className="text-lg font-medium text-red-500 text-left"
            >
              Log out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
