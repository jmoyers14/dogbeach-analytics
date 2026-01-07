import { model, InferSchemaType, Schema } from "mongoose";

export type Event = InferSchemaType<typeof eventSchema>;

const eventSchema = new Schema(
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
            timeField: "receivedAt",
            metaField: "projectId",
            granularity: "minutes",
        },
    }
);

eventSchema.index({ projectId: 1, receivedAt: -1 });
eventSchema.index({ projectId: 1, name: 1, receivedAt: -1 });
eventSchema.index({ projectId: 1, userId: 1, receivedAt: -1 });

export const EventModel = model("Event", eventSchema);
