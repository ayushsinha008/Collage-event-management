import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env.config';
import { logger } from './utils/logger';

let server: any;
let mongoMemoryServer: any;

const connectDB = async () => {
  try {
    logger.info(`Connecting to MongoDB at ${env.MONGO_URI}...`);
    const conn = await mongoose.connect(env.MONGO_URI, { serverSelectionTimeoutMS: 4000 });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn('Failed to connect to local MongoDB. Initializing in-memory MongoDB fallback...');
    try {
      const { MongoMemoryReplSet } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
      const uri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(uri);
      logger.info(`In-memory MongoDB Connected: ${conn.connection.host}`);
      
      logger.info('Seeding in-memory database with initial mock data...');
      const { seedData } = require('./utils/seed');
      await seedData(false, false);
      logger.info('In-memory database seeded successfully.');
    } catch (memError) {
      logger.error('Failed to initialize in-memory MongoDB:', memError);
      process.exit(1);
    }
  }
};

const startServer = async () => {
  await connectDB();

  server = app.listen(env.PORT, () => {
    logger.info(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
};

startServer();

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      try {
        await mongoose.connection.close(false);
        logger.info('MongoDB connection closed.');
        if (mongoMemoryServer) {
          await mongoMemoryServer.stop();
          logger.info('In-memory MongoDB stopped.');
        }
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (err: any) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err: any) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  gracefulShutdown('uncaughtException');
});
