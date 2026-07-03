import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  event: mongoose.Types.ObjectId;
  title: string;
  message: string;
  audience: 'all' | 'event-attendees' | 'vip';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: {
      type: String,
      enum: ['all', 'event-attendees', 'vip'],
      default: 'event-attendees',
    },
    status: { type: String, enum: ['draft', 'scheduled', 'sent'], default: 'draft' },
    scheduledAt: Date,
    sentAt: Date,
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
