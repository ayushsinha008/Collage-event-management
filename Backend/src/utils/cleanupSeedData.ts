import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Ticket } from '../models/Ticket.model';
import { env } from '../config/env.config';
import { logger } from './logger';

const SEED_EVENT_TITLE = /^Tech Fest Event \d+$/i;
const SEED_USER_EMAIL = /@festflow\.com$/i;

export const cleanupSeedData = async (shouldConnect = true, shouldExit = true) => {
  if (shouldConnect) {
    await mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB connected for seed cleanup');
  }

  try {
    const seedEvents = await Event.find({ title: SEED_EVENT_TITLE }).select('_id title');
    const seedEventIds = seedEvents.map((e) => e._id);

    let deletedTickets = 0;
    let deletedRegistrations = 0;

    if (seedEventIds.length > 0) {
      const seedRegs = await Registration.find({ event: { $in: seedEventIds } }).select('_id');
      const regIds = seedRegs.map((r) => r._id);

      if (regIds.length > 0) {
        const ticketResult = await Ticket.deleteMany({ registration: { $in: regIds } });
        deletedTickets = ticketResult.deletedCount ?? 0;
      }

      const regResult = await Registration.deleteMany({ event: { $in: seedEventIds } });
      deletedRegistrations = regResult.deletedCount ?? 0;

      const eventResult = await Event.deleteMany({ _id: { $in: seedEventIds } });
      logger.info(`Removed ${eventResult.deletedCount ?? 0} seed events`);
      seedEvents.forEach((e) => logger.info(`  - ${e.title}`));
    } else {
      logger.info('No seed events found (Tech Fest Event 1–30)');
    }

    const seedUsers = await User.find({ email: SEED_USER_EMAIL }).select('_id email');
    if (seedUsers.length > 0) {
      const userResult = await User.deleteMany({ email: SEED_USER_EMAIL });
      logger.info(`Removed ${userResult.deletedCount ?? 0} seed users`);
      seedUsers.forEach((u) => logger.info(`  - ${u.email}`));
    } else {
      logger.info('No seed users found (@festflow.com)');
    }

    logger.info(
      `Cleanup complete. Events: ${seedEventIds.length}, registrations: ${deletedRegistrations}, tickets: ${deletedTickets}`
    );

    if (shouldExit) process.exit(0);
  } catch (error) {
    logger.error('Seed cleanup failed:', error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  cleanupSeedData(true, true);
}
