const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ascend_ai';
  
  try {
    console.log(`Attempting to connect to MongoDB at: ${primaryUri}`);
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('MongoDB connected successfully via native URI.');
  } catch (err) {
    console.warn(`Standard MongoDB connection could not be established (${err.message}).`);
    console.log('Initializing embedded MongoDB Memory Server for seamless local execution...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const memUri = mongodInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`Connected to in-memory MongoDB at: ${memUri}`);
    } catch (memErr) {
      console.error('Fatal: Failed to start embedded MongoDB Memory Server:', memErr);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
