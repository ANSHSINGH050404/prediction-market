/**
 * src/lib/resolutionAgent.ts
 *
 * AI Resolution Agent — uses an LLM (OpenAI GPT-4o) to resolve a
 * prediction market by analysing a news summary and the available outcomes.
 *
 * Usage:
 *   const result = await resolveMarket({
 *     marketTitle: "Will India win the 2025 ICC World Cup?",
 *     newsSummary: "India defeated Australia by 6 wickets...",
 *     outcomes: [
 *       { id: "abc123", label: "Yes" },
 *       { id: "def456", label: "No" },
 *     ],
 *   });
 *   // → { winner: "abc123", confidence: 0.97, reasoning: "..." }
 */

import OpenAI from "openai";
import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ResolutionInput {
  marketTitle: string;
  /** Short news blurb / article summary describing the real-world outcome */
  newsSummary: string;
  /** All outcomes for this market (must include their DB IDs) */
  outcomes: Array<{ id: string; label: string }>;
}

/** The parsed resolution decision returned by the agent */
export interface ResolutionOutput {
  /** The `id` (Outcome.id) of the winning outcome */
  winner: string;
  /** Agent's confidence in its decision (0.0 – 1.0) */
  confidence: number;
  /** Plain-English explanation of why this outcome won */
  reasoning: string;
}

// ── Zod schema — validates the raw LLM JSON output ───────────────────────────

const ResolutionSchema = z.object({
  winner: z.string().min(1),
  confidence: z.number().min(0).max(1),
  reasoning: z.string().min(1),
});

// ── OpenAI client (lazy singleton) ───────────────────────────────────────────

let _client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(outcomes: ResolutionInput["outcomes"]): string {
  const outcomeList = outcomes
    .map((o) => `  - ID: "${o.id}" → Label: "${o.label}"`)
    .join("\n");

  return `You are a fair and impartial prediction market resolver for an Indian virtual-points platform.

Your job is to read a market title and a news summary, then determine which outcome 
has been ACTUALLY realised in the real world.

Available outcomes:
${outcomeList}

Rules:
1. Choose EXACTLY ONE winner from the provided outcome IDs.
2. Confidence must be a float between 0.0 and 1.0.
3. If the news summary is ambiguous or inconclusive, set confidence below 0.5 and pick the most likely outcome.
4. Respond ONLY with a valid JSON object — no markdown fences, no extra text:
{
  "winner": "<exact outcome ID>",
  "confidence": <float 0-1>,
  "reasoning": "<one or two sentences explaining your decision>"
}`;
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function resolveMarket(
  input: ResolutionInput,
): Promise<ResolutionOutput> {
  const { marketTitle, newsSummary, outcomes } = input;

  if (outcomes.length < 2) {
    throw new Error("A market must have at least two outcomes to resolve");
  }

  const client = getOpenAIClient();

  // ── LLM call ─────────────────────────────────────────────────────────────
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    temperature: 0, // deterministic — critical for financial resolution logic
    max_tokens: 512,
    response_format: { type: "json_object" }, // enforces JSON mode
    messages: [
      {
        role: "system",
        content: buildSystemPrompt(outcomes),
      },
      {
        role: "user",
        content: [
          `Market title: "${marketTitle}"`,
          ``,
          `News summary:`,
          newsSummary.trim(),
        ].join("\n"),
      },
    ],
  });

  // ── Parse & validate ──────────────────────────────────────────────────────
  const raw = response.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("LLM returned an empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`LLM response is not valid JSON: ${raw}`);
  }

  const validated = ResolutionSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error(
      `LLM response failed schema validation: ${validated.error.message}`,
    );
  }

  const { winner, confidence, reasoning } = validated.data;

  // ── Sanity-check: ensure the winner ID is one we actually provided ────────
  const validIds = new Set(outcomes.map((o) => o.id));
  if (!validIds.has(winner)) {
    throw new Error(
      `LLM returned an unknown outcome ID "${winner}". Valid IDs: ${[...validIds].join(", ")}`,
    );
  }

  return { winner, confidence, reasoning };
}

// ── Convenience: resolve & persist to Prisma in one call ─────────────────────

import { prisma } from "@/lib/prisma";

/**
 * Resolves a market using the LLM agent and saves the result to the database.
 * Also updates the market status to RESOLVED.
 *
 * @throws if the market is not CLOSED or the LLM call fails
 */
export async function resolveAndPersistMarket(
  marketId: string,
): Promise<ResolutionOutput> {
  // 1. Fetch the market with its outcomes and news summary
  const market = await prisma.market.findUnique({
    where: { id: marketId },
    include: { outcomes: true },
  });

  if (!market) throw new Error(`Market ${marketId} not found`);
  if (market.status !== "CLOSED") {
    throw new Error(
      `Market must be CLOSED before resolving (current: ${market.status})`,
    );
  }
  if (!market.newsSummary) {
    throw new Error(
      "Market has no newsSummary to feed to the resolution agent",
    );
  }

  // 2. Call the LLM
  const resolution = await resolveMarket({
    marketTitle: market.title,
    newsSummary: market.newsSummary,
    outcomes: market.outcomes.map((o) => ({ id: o.id, label: o.label })),
  });

  // 3. Persist resolution + update market status in a single transaction
  await prisma.$transaction([
    prisma.resolution.create({
      data: {
        marketId,
        winnerId: resolution.winner,
        confidence: resolution.confidence,
        reasoning: resolution.reasoning,
      },
    }),
    prisma.market.update({
      where: { id: marketId },
      data: { status: "RESOLVED", resolvedAt: new Date() },
    }),
  ]);

  return resolution;
}
