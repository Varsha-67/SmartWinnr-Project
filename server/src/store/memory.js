const metrics = {
  activeUsers: 0,
  signUps: 0,
  sales: 0,
  timeseries: [], // { t: timestamp, activeUsers, signUps, sales }
};

const User = require('../models/User');

async function snapshotFromDb() {
  const total = await User.countDocuments({});
  const activeUsers = await User.countDocuments({ status: 'active' });
  const signUps = Math.max(0, total - 1); // exclude seeded admin
  const sales = metrics.sales || 0; // sample metric; keep current if set
  return { activeUsers, signUps, sales };
}

function seedMetrics() {
  metrics.timeseries = [];
  metrics.activeUsers = 0;
  metrics.signUps = 0;
  metrics.sales = 0;
}

async function tickMetrics() {
  const snap = await snapshotFromDb();
  const next = { t: new Date(), ...snap };
  metrics.timeseries.push(next);
  if (metrics.timeseries.length > 360) metrics.timeseries.shift();
  metrics.activeUsers = next.activeUsers;
  metrics.signUps = next.signUps;
  metrics.sales = next.sales;
  return next;
}

function getSummary() {
  return {
    activeUsers: metrics.activeUsers,
    signUps: metrics.signUps,
    sales: metrics.sales,
  };
}

function getTimeseries() {
  return metrics.timeseries;
}

module.exports = {
  metrics,
  seedMetrics,
  tickMetrics,
  getSummary,
  getTimeseries,
};
