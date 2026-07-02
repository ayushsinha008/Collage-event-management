import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  category: string;
  venue: string;
  date: Date;
  startTime: string;
  endTime: string;
  capacity: number;
  registrationCount: number;
  checkedInCount: number;
  bannerImage?: string;
  organizer: mongoose.Types.ObjectId; // Reference to User
  club?: mongoose.Types.ObjectId; // Reference to Club
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  tags: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    venue: { type: String, required: true },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registrationCount: { type: Number, default: 0 },
    checkedInCount: { type: Number, default: 0 },
    bannerImage: { type: String },
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    club: { type: Schema.Types.ObjectId, ref: 'Club' },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.pre('save', function () {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Math.random().toString(36).substring(2, 8);
  }
});

export const Event = mongoose.model<IEvent>('Event', eventSchema);
