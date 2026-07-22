const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files if present
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

module.exports = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'msc-club-credentials-secret-key-2026',
  DATABASE_URL: process.env.DATABASE_URL || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
