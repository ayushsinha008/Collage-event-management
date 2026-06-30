import mongoose from 'mongoose';
import { Ticket } from '../models/Ticket.model';
import { Event } from '../models/Event.model';
import { ApiError } from '../utils/ApiError';
import { AuthUser, TicketStatus, Role } from '../types';

export class CheckInService {
  static async processCheckIn(qrToken: string, user: AuthUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const ticket = await Ticket.findOne({ qrToken }).populate({
        path: 'registration',
        populate: { path: 'event' },
      }).session(session);

      if (!ticket) {
        throw new ApiError(404, 'Invalid ticket or ticket not found');
      }

      if (ticket.status === TicketStatus.CANCELLED) {
        throw new ApiError(400, 'Ticket has been cancelled');
      }

      if (ticket.status === TicketStatus.USED) {
        throw new ApiError(400, 'Ticket has already been used');
      }

      const registration = ticket.registration as any;
      const event = registration.event;

      // Volunteer/Organizer authorization check could be added here
      // For now, assuming middleware handles it. If needed:
      // if (user.role === Role.VOLUNTEER && event.organizer.toString() !== user._id) -> Needs specific volunteer assignment logic

      ticket.status = TicketStatus.USED;
      ticket.usedAt = new Date();
      await ticket.save({ session });

      const updatedEvent = await Event.findById(event._id).session(session);
      if (updatedEvent) {
        updatedEvent.checkedInCount += 1;
        await updatedEvent.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      return {
        ticket: ticket,
        event: updatedEvent,
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}
