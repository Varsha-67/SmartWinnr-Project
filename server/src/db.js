const mongoose = require('mongoose');
const { MONGO_URI } = require('./config');

async function connectDb() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(MONGO_URI, { dbName: undefined });
  return mongoose.connection;
}

module.exports = { connectDb };

