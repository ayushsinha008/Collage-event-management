import { Event, IEvent } from '../models/Event.model';
import { ApiError } from '../utils/ApiError';
import { APIFeatures } from '../utils/apiFeatures';
import { AuthUser, Role } from '../types';

export class EventService {
  static async getEvents(queryString: any): Promise<{ events: IEvent[]; total: number }> {
    // Only return non-deleted events
    let filter = { isDeleted: false };
    
    const features = new APIFeatures(Event.find(filter).populate('organizer', 'name email'), queryString)
      .filter()
      .search(['title', 'description', 'category', 'venue', 'tags'])
      .sort()
      .paginate();

    const events = await features.query;
    const totalFeatures = new APIFeatures(Event.find(filter), queryString).filter().search(['title', 'description', 'category', 'venue', 'tags']);
    const total = await totalFeatures.query.countDocuments();

    return { events, total };
  }

  static async getEventById(id: string): Promise<IEvent> {
    const event = await Event.findOne({ _id: id, isDeleted: false }).populate('organizer', 'name email');
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }
    return event;
  }

  static async createEvent(data: any, user: AuthUser): Promise<IEvent> {
    const event = await Event.create({
      ...data,
      organizer: user._id,
      createdBy: user._id,
      updatedBy: user._id,
    });
    return event;
  }

  static async updateEvent(id: string, data: Partial<IEvent>, user: AuthUser): Promise<IEvent> {
    const event = await Event.findOne({ _id: id, isDeleted: false });
    
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    // Only Admin or the Event Organizer can update
    if (user.role !== Role.ADMIN && event.organizer.toString() !== user._id) {
      throw new ApiError(403, 'You do not have permission to update this event');
    }

    Object.assign(event, data);
    event.updatedBy = user._id as any;
    
    await event.save();
    return event;
  }

  static async softDeleteEvent(id: string, user: AuthUser): Promise<void> {
    const event = await Event.findOne({ _id: id, isDeleted: false });
    
    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (user.role !== Role.ADMIN && event.organizer.toString() !== user._id) {
      throw new ApiError(403, 'You do not have permission to delete this event');
    }

    event.isDeleted = true;
    event.deletedAt = new Date();
    event.updatedBy = user._id as any;
    
    await event.save();
  }
}
