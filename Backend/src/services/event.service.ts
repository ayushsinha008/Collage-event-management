import { Event, IEvent } from '../models/Event.model';
import { Registration } from '../models/Registration.model';
import { Ticket } from '../models/Ticket.model';
import { ApiError } from '../utils/ApiError';
import { APIFeatures } from '../utils/apiFeatures';
import { AuthUser, Role, RegistrationStatus, TicketStatus } from '../types';
import { uploadImage } from './cloudinary.service';
import { excludeSeedEventsFilter } from '../constants/seed.constants';

const isBase64Image = (value: string) =>
  value.startsWith('data:image/') || (!value.startsWith('http') && value.length > 100);

const resolveBannerImage = async (bannerImage?: string): Promise<string | undefined> => {
  if (!bannerImage) return undefined;
  if (isBase64Image(bannerImage)) {
    return uploadImage(bannerImage, 'events');
  }
  if (bannerImage.startsWith('http') && !bannerImage.includes('res.cloudinary.com')) {
    return uploadImage(bannerImage, 'events');
  }
  return bannerImage;
};

export class EventService {
  static async getEvents(queryString: any): Promise<{ events: IEvent[]; total: number }> {
    // Only return non-deleted events and exclude Drafts
    let filter: Record<string, unknown> = {
      isDeleted: false,
      status: { $ne: 'Draft' },
      ...excludeSeedEventsFilter,
    };
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
    const bannerImage = await resolveBannerImage(data.bannerImage);
    const event = await Event.create({
      ...data,
      bannerImage,
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

    if (data.bannerImage) {
      data.bannerImage = await resolveBannerImage(data.bannerImage);
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

    const activeRegistrations = await Registration.find({
      event: id,
      status: RegistrationStatus.CONFIRMED,
    }).select('_id');

    if (activeRegistrations.length > 0) {
      const registrationIds = activeRegistrations.map((r) => r._id);

      await Registration.updateMany(
        { _id: { $in: registrationIds } },
        { status: RegistrationStatus.CANCELLED }
      );

      await Ticket.updateMany(
        { registration: { $in: registrationIds }, status: TicketStatus.ACTIVE },
        { status: TicketStatus.CANCELLED }
      );
    }

    event.registrationCount = 0;
    await event.save();
  }
}
