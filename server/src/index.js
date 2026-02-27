const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { PORT, ORIGIN, ADMIN_EMAIL, ADMIN_PASSWORD } = require('./config');
const { connectDb } = require('./db');
const { seedMetrics } = require('./store/memory');
const { attach } = require('./socket');
const User = require('./models/User');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const metricsRoutes = require('./routes/metrics');

async function start() {
  await connectDb();
  // Ensure admin user exists
  const admin = await User.findOne({ email: ADMIN_EMAIL }).lean();
  if (!admin) {
    const bcrypt = require('bcryptjs');
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin', status: 'active' });
    console.log(`Seeded admin: ${ADMIN_EMAIL}`);
  }

  const app = express();
  app.use(cors({ origin: ORIGIN, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (req, res) => res.json({ ok: true, service: 'server', time: new Date().toISOString() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/metrics', metricsRoutes);

  seedMetrics();

  const server = http.createServer(app);
  attach(server, ORIGIN);

  server.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
