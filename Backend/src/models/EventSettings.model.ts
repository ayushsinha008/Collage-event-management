import mongoose, { Schema, Document } from 'mongoose';

export interface IEventSettings extends Document {
  event: mongoose.Types.ObjectId;
  registrationOpen: boolean;
  waitlistEnabled: boolean;
  requireApproval: boolean;
  sendConfirmationEmail: boolean;
  sendReminderHoursBefore: number;
  allowCheckInWindow: number;
  ticketTemplate: string;
  collectPhone: boolean;
  cancellationPolicy?: string;
  refundPolicy?: string;
}

const eventSettingsSchema = new Schema<IEventSettings>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true, unique: true },
    registrationOpen: { type: Boolean, default: true },
    waitlistEnabled: { type: Boolean, default: true },
    requireApproval: { type: Boolean, default: false },
    sendConfirmationEmail: { type: Boolean, default: true },
    sendReminderHoursBefore: { type: Number, default: 24 },
    allowCheckInWindow: { type: Number, default: 30 },
    ticketTemplate: { type: String, default: 'standard' },
    collectPhone: { type: Boolean, default: true },
    cancellationPolicy: String,
    refundPolicy: String,
  },
  { timestamps: true }
);

export const EventSettings = mongoose.model<IEventSettings>('EventSettings', eventSettingsSchema);
