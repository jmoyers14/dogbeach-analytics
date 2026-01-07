import { injectable } from "tsyringe";
import { Event, EventModel } from "../models/Event.js";
import { RootFilterQuery } from "mongoose";

const DEFAULT_PAGE_SIZE = 50;

export interface TrackEventInput {
    name: string;
    timestamp: Date;
    userId?: string;
    sessionId?: string;
    properties?: Record<string, any>;
}

export interface TrackEventsInput {
    projectId: string;
    events: TrackEventInput[];
}

export interface QueryEventsInput {
    projectId: string;
    startDate?: Date;
    endDate?: Date;
    eventName?: string;
    limit?: number;
    offset?: number;
}

export interface QueryEventsResult {
    events: Event[];
    total: number;
    hasMore: boolean;
}

@injectable()
export class EventService {
    async deleteProjectEvents(projectId: string): Promise<number> {
        const result = await EventModel.deleteMany({ projectId });
        return result.deletedCount;
    }

    async queryEvents(input: QueryEventsInput): Promise<QueryEventsResult> {
        const { limit = DEFAULT_PAGE_SIZE, offset = 0 } = input;

        const filter = this.buildEventFilter(input);

        const [events, total] = await Promise.all([
            EventModel.find(filter)
                .sort({ receivedAt: -1 })
                .skip(offset)
                .limit(limit)
                .lean(),
            EventModel.countDocuments(filter),
        ]);

        return {
            events,
            total,
            hasMore: offset + events.length < total,
        };
    }

    async trackEvents(input: TrackEventsInput): Promise<number> {
        const { projectId, events } = input;

        if (events.length === 0) {
            return 0;
        }

        if (events.length > 100) {
            throw new Error("Cannot track more than 100 events at once");
        }

        const receivedAt = new Date();
        const eventDocuments = events.map((event) => ({
            projectId,
            name: event.name,
            timestamp: event.timestamp,
            receivedAt,
            userId: event.userId,
            sessionId: event.sessionId,
            properties: event.properties,
        }));

        const result = await EventModel.insertMany(eventDocuments);
        return result.length;
    }

    private buildEventFilter(
        input: Pick<
            QueryEventsInput,
            "endDate" | "eventName" | "projectId" | "startDate"
        >
    ): RootFilterQuery<Event> {
        const { endDate, eventName, projectId, startDate } = input;

        const filter: RootFilterQuery<Event> = { projectId };

        if (startDate || endDate) {
            filter.receivedAt = {};
            if (startDate) {
                filter.receivedAt.$gte = startDate;
            }
            if (endDate) {
                filter.receivedAt.$lte = endDate;
            }
        }

        if (eventName) {
            filter.name = eventName;
        }

        return filter;
    }
}
