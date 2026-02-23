const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");
  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  // 1. Create Sample Markets
  const markets = [
    {
      title: "Will Team India win the next T20 series against Australia?",
      description:
        "The upcoming T20 series is scheduled to start next week. This market predicts the overall series winner.",
      category: "Cricket",
      closesAt: new Date(Date.now() + 7 * MS_PER_DAY),
      outcomes: ["Yes", "No"],
    },
    {
      title: "Will the BSE Sensex cross 85,000 points by end of March?",
      description:
        "The Indian stock market has been volatile. This market predicts if the BSE Sensex will hit the 85k milestone.",
      category: "Finance",
      closesAt: new Date(Date.now() + 30 * MS_PER_DAY),
      outcomes: ["Yes", "No"],
    },
    {
      title: "Will a major Indian startup IPO in Q2 2024?",
      description:
        "Several unicorns are rumored to be planning their public debuts.",
      category: "Tech",
      closesAt: new Date(Date.now() + 60 * MS_PER_DAY),
      outcomes: ["Yes", "No"],
    },
    {
      title: "Will the monsoon arrive in Kerala before June 1st?",
      description: "Predicting the onset of the Southwest Monsoon in India.",
      category: "Environment",
      closesAt: new Date("2024-05-31T23:59:59Z"),
      outcomes: ["Yes", "No"],
    },
  ];

  for (const m of markets) {
    const market = await prisma.market.create({
      data: {
        title: m.title,
        description: m.description,
        closesAt: m.closesAt,
        status: "OPEN",
        // We'll manually handle outcomes creation here
      },
    });

    for (const label of m.outcomes) {
      await prisma.outcome.create({
        data: {
          label,
          marketId: market.id,
          totalPoints: Math.floor(Math.random() * 5000) + 1000, // Random initial liquidity
        },
      });
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
