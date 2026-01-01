import { Schema, model, Document } from 'mongoose';

export interface EventDocument extends Document {
  projectId: string;
  name: string;
  timestamp: Date;
  receivedAt: Date;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

const eventSchema = new Schema<EventDocument>(
  {
    projectId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    receivedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    userId: {
      type: String,
      index: true,
    },
    sessionId: {
      type: String,
    },
    properties: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timeseries: {
      timeField: 'receivedAt',
      metaField: 'projectId',
      granularity: 'minutes',
    },
  }
);

// Compound indexes for efficient querying
eventSchema.index({ projectId: 1, receivedAt: -1 });
eventSchema.index({ projectId: 1, name: 1, receivedAt: -1 });
eventSchema.index({ projectId: 1, userId: 1, receivedAt: -1 });

export const Event = model<EventDocument>('Event', eventSchema);
