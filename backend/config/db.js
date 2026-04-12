const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    // If Mongo fails, we gracefully continue (server will use in-memory mode if configured)
    console.log('⚠️ Falling back to In-Memory mode if necessary.');
  }
};

module.exports = connectDB;
