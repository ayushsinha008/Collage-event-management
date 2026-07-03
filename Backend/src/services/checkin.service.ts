import mongoose from 'mongoose';
import { Ticket } from '../models/Ticket.model';
import { Event } from '../models/Event.model';
import { ApiError } from '../utils/ApiError';
import { AuthUser, TicketStatus, Role } from '../types';
import { OrganizerService } from './organizer.service';

export class CheckInService {
  static async processCheckIn(qrToken: string, user: AuthUser) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const ticket = await Ticket.findOne({
        $or: [{ qrToken: qrToken }, { ticketCode: qrToken }]
      }).populate({
        path: 'registration',
        populate: [
          { path: 'event' },
          { path: 'user', select: 'name email' },
        ],
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

      // Create Notification for the organizer
      try {
        await OrganizerService.createNotification(
          event.organizer.toString(),
          'Attendee Checked In',
          `Student "${registration.user?.email || registration.user?.name || 'Attendee'}" has checked in for event "${event.title}".`,
          'CHECKIN'
        );
      } catch (err) {
        console.error('Failed to create check-in notification:', err);
      }

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
