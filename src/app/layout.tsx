import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PredictIN | India's #1 Gamified Prediction Market",
  description:
    "Predict real-world events in India and win virtual points. No real money, just pure strategy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} antialiased bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50`}
      >
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            {/* Subtle background gradient pattern */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
            </div>

            <Navbar />
            <main className="flex-grow pt-16">{children}</main>

            <footer className="py-12 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <p className="text-sm text-zinc-500">
                  © {new Date().getFullYear()} PredictIN. Virtual points only.
                  Play responsibly.
                </p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
