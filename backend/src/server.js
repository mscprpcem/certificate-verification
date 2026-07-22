const app = require("./app");
const env = require("./config/env");
const prisma = require("./config/database");
const { seedInitialData } = require("./config/seeder");

const PORT = env.PORT || 3000;

// Initialize Database & Listen
prisma
  .$connect()
  .then(async () => {
    console.log("Connected to PostgreSQL via Prisma ORM.");
    await seedInitialData();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
