const mongoose = require('mongoose');

module.exports = async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { maxPoolSize: 50, serverSelectionTimeoutMS: 8000 });
  console.log('MongoDB connected');
};
