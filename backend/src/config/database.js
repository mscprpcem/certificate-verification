const { Sequelize } = require("sequelize");
const env = require("./env");
const path = require("path");

let sequelize;

const dbUrl = env.DATABASE_URL || "";
const isNeonPlaceholder = dbUrl.includes("ep-xxxx") || dbUrl.includes("password@");

if (dbUrl && dbUrl.includes("postgres") && !isNeonPlaceholder) {
  sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  });
} else {
  // SQLite fallback for local development before actual Neon URL is supplied
  const dbPath = path.join(__dirname, "../../../credentials.db");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false
  });
}

module.exports = sequelize;
