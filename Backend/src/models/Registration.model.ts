import mongoose, { Schema, Document } from 'mongoose';
import { RegistrationStatus } from '../types';

export interface IRegistration extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    status: {
      type: String,
      enum: Object.values(RegistrationStatus),
      default: RegistrationStatus.CONFIRMED,
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistration>('Registration', registrationSchema);
