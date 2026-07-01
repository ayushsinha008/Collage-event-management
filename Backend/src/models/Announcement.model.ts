import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  event: mongoose.Types.ObjectId;
  title: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
