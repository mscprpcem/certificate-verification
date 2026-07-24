const env = require("./config/env");
const app = require("./app");
const prisma = require("./config/database");
const { seedInitialData } = require("./config/seeder");

const PORT = env.PORT || 3000;

// Start Express server immediately so Azure health checks succeed & 503 is prevented
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

// Connect to Database & Seed asynchronously
prisma
  .$connect()
  .then(async () => {
    console.log("Connected to PostgreSQL via Prisma ORM.");
    await seedInitialData();
  })
  .catch((err) => {
    console.error("Database connection warning:", err.message || err);
  });

