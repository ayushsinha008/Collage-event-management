import mongoose from 'mongoose';
import { Event } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Ticket } from '../models/Ticket.model';
import { ApiError } from '../utils/ApiError';
import { AuthUser, RegistrationStatus, TicketStatus, Role } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { generateQRCode } from './qr.service';
import { APIFeatures } from '../utils/apiFeatures';

export class RegistrationService {
  static async registerForEvent(eventId: string, user: AuthUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const event = await Event.findById(eventId).session(session);
      if (!event) {
        throw new ApiError(404, 'Event not found');
      }

      if (event.isDeleted) {
        throw new ApiError(400, 'Cannot register for a deleted event');
      }

      if (event.status !== 'Upcoming') {
        throw new ApiError(400, `Cannot register for an event that is ${event.status}`);
      }

      // Optimistic concurrency / Capacity check
      if (event.registrationCount >= event.capacity) {
        throw new ApiError(400, 'Event has reached maximum capacity');
      }

      // Check if already registered
      const existingRegistration = await Registration.findOne({
        user: user._id,
        event: eventId,
      }).session(session);

      if (existingRegistration && existingRegistration.status === RegistrationStatus.CONFIRMED) {
        throw new ApiError(400, 'You are already registered for this event');
      }

      let registration;

      if (existingRegistration && existingRegistration.status === RegistrationStatus.CANCELLED) {
        existingRegistration.status = RegistrationStatus.CONFIRMED;
        existingRegistration.registeredAt = new Date();
        registration = await existingRegistration.save({ session });
      } else {
        registration = await Registration.create(
          [
            {
              user: user._id,
              event: eventId,
              status: RegistrationStatus.CONFIRMED,
            },
          ],
          { session }
        );
        registration = registration[0];
      }

      // Generate Ticket
      const ticketCode = `TKT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
      const qrToken = uuidv4();
      const qrCodeDataUri = await generateQRCode(qrToken);

      let ticket;
      const existingTicket = await Ticket.findOne({ registration: registration._id }).session(session);
      
      if (existingTicket) {
        existingTicket.ticketCode = ticketCode;
        existingTicket.qrToken = qrToken;
        existingTicket.status = TicketStatus.ACTIVE;
        ticket = await existingTicket.save({ session });
      } else {
        const createdTickets = await Ticket.create(
          [
            {
              registration: registration._id,
              ticketCode,
              qrToken,
              status: TicketStatus.ACTIVE,
            },
          ],
          { session }
        );
        ticket = createdTickets[0];
      }

      // Update Event Registration Count
      event.registrationCount += 1;
      await event.save({ session });

      await session.commitTransaction();
      session.endSession();

      return { registration, ticket, qrCode: qrCodeDataUri };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async cancelRegistration(eventId: string, user: AuthUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const registration = await Registration.findOne({
        user: user._id,
        event: eventId,
        status: RegistrationStatus.CONFIRMED,
      }).session(session);

      if (!registration) {
        throw new ApiError(404, 'Active registration not found');
      }

      registration.status = RegistrationStatus.CANCELLED;
      await registration.save({ session });

      const ticket = await Ticket.findOne({
        registration: registration._id,
        status: TicketStatus.ACTIVE,
      }).session(session);

      if (ticket) {
        ticket.status = TicketStatus.CANCELLED;
        await ticket.save({ session });
      }

      const event = await Event.findById(eventId).session(session);
      if (event) {
        event.registrationCount = Math.max(0, event.registrationCount - 1);
        await event.save({ session });
      }

      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  static async getUserEvents(userId: string, queryString: any) {
    const features = new APIFeatures(
      Registration.find({ user: userId, status: RegistrationStatus.CONFIRMED }).populate('event'),
      queryString
    )
      .sort()
      .paginate();

    const registrations = await features.query;
    return registrations;
  }

  static async getUserTickets(userId: string, queryString: any) {
    const registrations = await Registration.find({
      user: userId,
      status: RegistrationStatus.CONFIRMED,
    }).select('_id');
    const registrationIds = registrations.map((r) => r._id);

    const features = new APIFeatures(
      Ticket.find({
        registration: { $in: registrationIds },
        status: TicketStatus.ACTIVE,
      }).populate({
        path: 'registration',
        populate: { path: 'event' },
      }),
      queryString
    )
      .sort()
      .paginate();

    const tickets = await features.query;
    
    // Generate QR code data URI for each ticket
    const ticketsWithQR = await Promise.all(tickets.map(async (ticket: any) => {
      const ticketObj = ticket.toObject();
      ticketObj.qrCodeDataUri = await generateQRCode(ticket.qrToken);
      return ticketObj;
    }));

    return ticketsWithQR.filter((ticket: any) => {
      const event = ticket.registration?.event;
      return event && !event.isDeleted;
    });
  }

  static async getTicketById(ticketId: string, user: AuthUser) {
    const ticket = await Ticket.findById(ticketId).populate({
      path: 'registration',
      populate: { path: 'event' },
    });

    if (!ticket) {
      throw new ApiError(404, 'Ticket not found');
    }

    const registration = ticket.registration as any;

    // Only Admin, Organizer, or the Ticket Owner can view it
    if (user.role === Role.STUDENT && registration.user.toString() !== user._id) {
      throw new ApiError(403, 'You do not have permission to view this ticket');
    }

    return ticket;
  }
}
