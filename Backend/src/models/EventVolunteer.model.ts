import mongoose, { Schema, Document } from 'mongoose';

export interface IEventVolunteer extends Document {
  event: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: 'invited' | 'accepted' | 'declined' | 'checked-in' | 'no-show';
  shift?: { start: string; end: string };
  assignedAt: Date;
  checkedInAt?: Date;
  notes?: string;
  avatarUrl?: string;
}

const eventVolunteerSchema = new Schema<IEventVolunteer>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: String,
    role: { type: String, required: true },
    status: {
      type: String,
      enum: ['invited', 'accepted', 'declined', 'checked-in', 'no-show'],
      default: 'invited',
    },
    shift: {
      start: String,
      end: String,
    },
    assignedAt: { type: Date, default: Date.now },
    checkedInAt: Date,
    notes: String,
    avatarUrl: String,
  },
  { timestamps: true }
);

export const EventVolunteer = mongoose.model<IEventVolunteer>('EventVolunteer', eventVolunteerSchema);
