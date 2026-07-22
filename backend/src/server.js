const app = require("./app");
const env = require("./config/env");
const sequelize = require("./config/database");
const { seedInitialData } = require("./config/seeder");

const PORT = env.PORT || 3000;

// Initialize Database & Listen
sequelize
  .authenticate()
  .then(async () => {
    console.log("Connected to Database via Sequelize ORM.");
    await sequelize.sync({ alter: false });
    await seedInitialData();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });
