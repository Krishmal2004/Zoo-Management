const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();

    if (!uri) {
      console.error('[db] MONGODB_URI is missing in backend/.env');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
    });

    console.log(
      `[db] MongoDB connected successfully: ${conn.connection.host} (database: ${conn.connection.name})`
    );
  } catch (err) {
    console.error(`[db] MongoDB connection failed: ${err.message}`);
    console.error(
      '[db] Check MONGODB_URI value and MongoDB Atlas network/database user settings.'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
