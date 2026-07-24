const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env files if present
dotenv.config({ path: path.join(__dirname, '../../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/msc_credentials";
}

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

module.exports = {
  PORT: port,
  NODE_ENV: process.env.NODE_ENV || 'development',
  SESSION_SECRET: process.env.SESSION_SECRET || 'msc-club-credentials-secret-key-2026',
  DATABASE_URL: process.env.DATABASE_URL,
  AZURE_STORAGE_CONNECTION_STRING: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
  AZURE_STORAGE_CONTAINER_NAME: process.env.AZURE_STORAGE_CONTAINER_NAME || 'certificate-templates',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173'
};
