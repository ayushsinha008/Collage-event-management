import mongoose, { Schema, Document } from 'mongoose';
import { TicketStatus } from '../types';

export interface ITicket extends Document {
  registration: mongoose.Types.ObjectId;
  ticketCode: string;
  qrToken: string;
  status: TicketStatus;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    registration: { type: Schema.Types.ObjectId, ref: 'Registration', required: true, unique: true },
    ticketCode: { type: String, required: true, unique: true, index: true },
    qrToken: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.ACTIVE,
    },
    usedAt: { type: Date },
  },
  { timestamps: true }
);

export const Ticket = mongoose.model<ITicket>('Ticket', ticketSchema);
