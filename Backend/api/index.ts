import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env.config';

// Disable Mongoose command buffering in serverless environment to prevent queries hanging if connection fails
mongoose.set('bufferCommands', false);

let cachedConnectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async () => {
  // 1 = connected, 2 = connecting
  if (mongoose.connection.readyState >= 1) return;

  // Skip connection on Vercel if URI is local, avoiding serverless timeout
  const isVercel = !!(process.env.VERCEL || process.env.NOW_REGION);
  if (isVercel && (env.MONGO_URI.includes('localhost') || env.MONGO_URI.includes('127.0.0.1'))) {
    console.warn('⚠️ Skipping MongoDB connection on Vercel: MONGO_URI is pointing to a local database.');
    return;
  }

  if (!cachedConnectionPromise) {
    console.log('Connecting to MongoDB on Vercel (new connection)...');
    cachedConnectionPromise = mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 4000,
    });
  }

  try {
    await cachedConnectionPromise;
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    cachedConnectionPromise = null; // reset to allow retry on next request
    console.error('MongoDB connection error:', error);
  }
};

// Middleware to connect to DB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export default app;
