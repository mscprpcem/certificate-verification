const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  PORT: 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'msc-club-credentials-secret-key-2026',
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../../credentials.db'),
  EVENT_API: process.env.EVENT_API || "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Sheet1",
  TEAM_API: process.env.TEAM_API || "https://opensheet.elk.sh/1G0kQL9J3e8Wn3CxjJEQr91dOfWscOoGFAGF1GvYgbxE/Team"
};
