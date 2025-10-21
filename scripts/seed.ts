import { getDb } from "../server/db";
import { users, creatorProfiles, posts } from "../drizzle/schema";
import { v4 as uuidv4 } from "uuid";

const sampleCreators = [
  {
    name: "Luna",
    bio: "Fitness enthusiast and wellness coach",
    price: 999,
  },
  {
    name: "Alex",
    bio: "Digital artist and design tutorials",
    price: 1499,
  },
  {
    name: "Jordan",
    bio: "Music production and beats",
    price: 799,
  },
  {
    name: "Casey",
    bio: "Gaming streams and reviews",
    price: 1299,
  },
  {
    name: "Morgan",
    bio: "Fashion and lifestyle content",
    price: 999,
  },
];

const samplePosts = [
  "Just finished an amazing workout! Feeling energized 💪",
  "New design tutorial coming this week",
  "Working on some fresh beats in the studio 🎵",
  "Live gaming session tonight at 8pm!",
  "New fashion collection dropping soon 👗",
];

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  console.log("Seeding database...");

  // Create sample creators
  for (const creator of sampleCreators) {
    const userId = uuidv4();
    const creatorId = uuidv4();

    // Create user
    await db.insert(users).values({
      id: userId,
      name: creator.name,
      email: `${creator.name.toLowerCase()}@thotsly.com`,
      loginMethod: "demo",
      role: "user",
    });

    // Create creator profile
    await db.insert(creatorProfiles).values({
      id: creatorId,
      userId,
      displayName: creator.name,
      bio: creator.bio,
      subscriptionPrice: creator.price,
      totalSubscribers: Math.floor(Math.random() * 5000) + 100,
      totalEarnings: Math.floor(Math.random() * 50000) * 100,
      isVerified: Math.random() > 0.7,
    });

    // Create sample posts
    for (let i = 0; i < 3; i++) {
      await db.insert(posts).values({
        id: uuidv4(),
        creatorId,
        content: samplePosts[Math.floor(Math.random() * samplePosts.length)],
        isPaid: Math.random() > 0.8,
        price: Math.random() > 0.8 ? Math.floor(Math.random() * 1000) + 100 : 0,
        likesCount: Math.floor(Math.random() * 500),
        commentsCount: Math.floor(Math.random() * 100),
      });
    }
  }

  console.log("✅ Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

