import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "../trpc";
import { format } from "date-fns";

interface EventsTableProps {
    projectId: string;
    filters?: {
        startDate?: Date;
        endDate?: Date;
        eventName?: string;
    };
}

export function EventsTable({ projectId, filters }: EventsTableProps) {
    const [eventNameFilter, setEventNameFilter] = useState("");
    const [offset, setOffset] = useState(0);
    const limit = 50;

    const eventsQuery = useQuery(
        trpc.events.query.queryOptions({
            projectId,
            startDate: filters?.startDate,
            endDate: filters?.endDate,
            eventName: eventNameFilter || undefined,
            limit,
            offset,
        })
    );

    const handleLoadMore = () => {
        setOffset(offset + limit);
    };

    const handleResetFilter = () => {
        setEventNameFilter("");
        setOffset(0);
    };

    if (eventsQuery.isLoading) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Events Timeline</h3>
                <div className="text-center py-8">
                    <p className="text-gray-600">Loading events...</p>
                </div>
            </div>
        );
    }

    if (eventsQuery.error) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Events Timeline</h3>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">Error loading events</p>
                </div>
            </div>
        );
    }

    const { events, hasMore } = eventsQuery.data || { events: [], hasMore: false };

    return (
        <div className="bg-white border-2 border-black rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Events Timeline</h3>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={eventNameFilter}
                        onChange={(e) => setEventNameFilter(e.target.value)}
                        placeholder="Filter by event name..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                    />
                    {eventNameFilter && (
                        <button
                            onClick={handleResetFilter}
                            className="px-3 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">No events found</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Event Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        User ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Session ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event: any, index: number) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(event.timestamp), 'MMM d, yyyy HH:mm:ss')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {event.name}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {event.userId || '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {event.sessionId || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {hasMore && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={handleLoadMore}
                                className="px-4 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
