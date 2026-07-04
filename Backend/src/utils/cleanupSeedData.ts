import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Ticket } from '../models/Ticket.model';
import { env } from '../config/env.config';
import { logger } from './logger';
import {
  SEED_EVENT_TITLE,
  SEED_EVENT_DESCRIPTION,
  SEED_USER_EMAIL,
} from '../constants/seed.constants';

export type SeedCleanupResult = {
  deletedEvents: number;
  deletedRegistrations: number;
  deletedTickets: number;
  deletedUsers: number;
  eventTitles: string[];
};

export const runSeedCleanup = async (): Promise<SeedCleanupResult> => {
  const seedEvents = await Event.find({
    $or: [{ title: SEED_EVENT_TITLE }, { description: SEED_EVENT_DESCRIPTION }],
  }).select('_id title');
  const seedEventIds = seedEvents.map((e) => e._id);
  const eventTitles = seedEvents.map((e) => e.title);

  let deletedTickets = 0;
  let deletedRegistrations = 0;
  let deletedEvents = 0;

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
    deletedEvents = eventResult.deletedCount ?? 0;
    logger.info(`Removed ${deletedEvents} seed events`);
    eventTitles.forEach((title) => logger.info(`  - ${title}`));
  } else {
    logger.info('No seed events found (Tech Fest Event 1–30)');
  }

  const seedUsers = await User.find({ email: SEED_USER_EMAIL }).select('_id email');
  let deletedUsers = 0;
  if (seedUsers.length > 0) {
    const userResult = await User.deleteMany({ email: SEED_USER_EMAIL });
    deletedUsers = userResult.deletedCount ?? 0;
    logger.info(`Removed ${deletedUsers} seed users`);
  } else {
    logger.info('No seed users found (@festflow.com)');
  }

  return {
    deletedEvents,
    deletedRegistrations,
    deletedTickets,
    deletedUsers,
    eventTitles,
  };
};

export const cleanupSeedData = async (shouldConnect = true, shouldExit = true) => {
  if (shouldConnect) {
    await mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB connected for seed cleanup');
  }

  try {
    const result = await runSeedCleanup();
    logger.info(
      `Cleanup complete. Events: ${result.deletedEvents}, registrations: ${result.deletedRegistrations}, tickets: ${result.deletedTickets}, users: ${result.deletedUsers}`
    );
    if (shouldExit) process.exit(0);
    return result;
  } catch (error) {
    logger.error('Seed cleanup failed:', error);
    if (shouldExit) process.exit(1);
    throw error;
  }
};

if (require.main === module) {
  cleanupSeedData(true, true);
}
