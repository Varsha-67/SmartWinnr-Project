const crypto = require('crypto');

const PORT = process.env.PORT ? Number(process.env.PORT) : 4001;
const ORIGIN = process.env.ORIGIN || 'http://localhost:4200';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mean_dashboard';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

module.exports = {
  PORT,
  ORIGIN,
  JWT_SECRET,
  MONGO_URI,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
};
