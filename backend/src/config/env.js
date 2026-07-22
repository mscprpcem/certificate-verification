const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files if present (does not overwrite existing environment variables set in Azure)
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

module.exports = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'msc-club-credentials-secret-key-2026',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../../credentials.db'),
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  EVENT_API: process.env.EVENT_API || "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Sheet1",
  TEAM_API: process.env.TEAM_API || "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Team"
};
