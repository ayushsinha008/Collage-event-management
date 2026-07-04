import mongoose from 'mongoose';
import { User } from '../models/User.model';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Ticket } from '../models/Ticket.model';
import { Role, RegistrationStatus, TicketStatus } from '../types';
import { env } from '../config/env.config';
import { logger } from '../utils/logger';
import crypto from 'crypto';

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB Connected for seeding');
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export const seedData = async (shouldConnect = true, shouldExit = true) => {
  if (shouldConnect) {
    await connectDB();
  }

  try {
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Ticket.deleteMany({});
    logger.info('Existing data cleared');

    // 1 Admin
    const admin = await User.create({
      uid: crypto.randomUUID(),
      name: 'Admin User',
      email: 'admin@festflow.com',
      role: Role.ADMIN,
    });

    // 5 Organizers
    const organizers = await User.insertMany(
      Array.from({ length: 5 }).map((_, i) => ({
        uid: crypto.randomUUID(),
        name: `Organizer ${i + 1}`,
        email: `organizer${i + 1}@festflow.com`,
        role: Role.ORGANIZER,
      }))
    );

    // 10 Volunteers
    const volunteers = await User.insertMany(
      Array.from({ length: 10 }).map((_, i) => ({
        uid: crypto.randomUUID(),
        name: `Volunteer ${i + 1}`,
        email: `volunteer${i + 1}@festflow.com`,
        role: Role.VOLUNTEER,
      }))
    );

    // 100 Students
    const students = await User.insertMany(
      Array.from({ length: 100 }).map((_, i) => ({
        uid: crypto.randomUUID(),
        name: `Student ${i + 1}`,
        email: `student${i + 1}@festflow.com`,
        role: Role.STUDENT,
        college: 'Engineering College',
        year: '2024',
      }))
    );

    // 30 Events
    const eventsData = Array.from({ length: 30 }).map((_, i) => {
      const organizer = organizers[i % organizers.length];
      return {
        title: `Tech Fest Event ${i + 1}`,
        description: `Description for awesome event ${i + 1}`,
        category: 'Technology',
        venue: `Auditorium ${i % 3 + 1}`,
        date: new Date(Date.now() + Math.random() * 10000000000), // Random future date
        startTime: '10:00',
        endTime: '12:00',
        capacity: 50 + Math.floor(Math.random() * 50),
        organizer: organizer._id,
        createdBy: admin._id,
        updatedBy: admin._id,
        status: 'Upcoming' as const,
      };
    });

    const events: any[] = [];
    for (const eventData of eventsData) {
      const event = await Event.create(eventData);
      events.push(event);
    }

    logger.info('Users and Events created. Generating 500 registrations...');

    // 500 Registrations
    const registrationsToCreate = [];
    let regCount = 0;

    for (let i = 0; i < 500; i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const event = events[Math.floor(Math.random() * events.length)];

      // avoid duplicates (simple check, not perfect but enough for seeding)
      registrationsToCreate.push({
        user: student._id,
        event: event._id,
        status: RegistrationStatus.CONFIRMED,
      });
    }

    // Insert ignoring duplicates if any
    try {
      const insertedRegistrations = await Registration.insertMany(registrationsToCreate, { ordered: false });

      // Update Event counts and generate tickets
      for (const reg of insertedRegistrations) {
        await Ticket.create({
          registration: reg._id,
          ticketCode: `TKT-${crypto.randomUUID().substring(0, 8).toUpperCase()}`,
          qrToken: crypto.randomUUID(),
          status: TicketStatus.ACTIVE,
        });

        await Event.findByIdAndUpdate(reg.event, { $inc: { registrationCount: 1 } });
      }
      regCount = insertedRegistrations.length;
    } catch (e: any) {
      // Ignored duplicate key errors
      logger.info('Some duplicates ignored during registration seeding.');
    }

    logger.info(`Database seeded successfully! Created ${regCount} valid registrations/tickets.`);
    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    logger.error('Seeding failed:', error);
    if (shouldExit) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  if (env.NODE_ENV === 'production' && process.env.ALLOW_SEED !== 'true') {
    logger.error(
      'Refusing to seed production database. Set ALLOW_SEED=true only if you really mean it.'
    );
    process.exit(1);
  }
  seedData(true, true);
}
