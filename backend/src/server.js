const app = require("./app");
const env = require("./config/env");
const { initDatabase } = require("./config/database");

const PORT = env.PORT || 3000;

// Initialize DB and Listen
initDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database initialization failed:", err);
  });
