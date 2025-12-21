// server/seed.js


require('dotenv').config();
const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to DB for Seeding"))
  .catch(err => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

const seedCandidates = async () => {
  try {
    // 1. CLEAR existing data (prevents duplicates)
    await Candidate.deleteMany({});
    console.log("🧹 Cleared existing candidates...");

    // 2. DEFINE new candidates (Matches your Schema exactly)
    const candidates = [
      {
        name: "Lee Paul Anto",
        description: "Focusing on AI-driven Healthcare solutions for rural areas. Leveraging machine learning to predict outbreaks.",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e", // Auto-generates an image with initials
        linkedinUrl: "https://www.linkedin.com/in/lee-paul-anto-57ba7b326",
        voteCount: 0
      },
      {
        name: "Raina Shaju",
        description: "Developing sustainable waste management using IoT sensors. Smart cities initiative for cleaner streets.",
        photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
        linkedinUrl: "https://www.linkedin.com/in/raina-shaju-9b1697335",
        voteCount: 0
      }
    ];

    // 3. INSERT new data
    await Candidate.insertMany(candidates);
    console.log("🌱 Candidates seeded successfully!");

    // 4. DISCONNECT
    mongoose.connection.close();
    console.log("🔌 Disconnected. Seed complete.");
    
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

// Run the function
seedCandidates();



