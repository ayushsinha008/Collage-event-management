import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  name: string;
  description: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const clubSchema = new Schema<IClub>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Club = mongoose.model<IClub>('Club', clubSchema);
