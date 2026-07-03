import mongoose from 'mongoose';
import app from '../src/app';
import { env } from '../src/config/env.config';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    console.log('Connecting to MongoDB on Vercel...');
    await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log('MongoDB Connected successfully.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Middleware to connect to DB before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

export default app;
