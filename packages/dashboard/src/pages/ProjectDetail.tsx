import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { trpc } from "../trpc";
import { DateRangePicker } from "../components/DateRangePicker";
import { DailyActiveUsersChart } from "../components/DailyActiveUsersChart";
import { EventBreakdownChart } from "../components/EventBreakdownChart";
import { EventsTable } from "../components/EventsTable";

export default function ProjectDetail() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();

    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());

    const projectsQuery = useQuery(trpc.projects.list.queryOptions());

    const statsQuery = useQuery(
        trpc.projects.stats.queryOptions({
            projectId: projectId!,
            startDate,
            endDate,
        })
    );

    const project = projectsQuery.data?.find(p => p.projectId === projectId);

    const handleDateChange = (newStartDate: Date, newEndDate: Date) => {
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    if (!projectId) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Invalid project ID</p>
            </div>
        );
    }

    if (projectsQuery.isLoading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Loading project...</p>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600 mb-4">Project not found</p>
                <button
                    onClick={() => navigate("/")}
                    className="text-black hover:text-gray-700 underline"
                >
                    Back to Projects
                </button>
            </div>
        );
    }

    const stats = statsQuery.data;

    return (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="text-black hover:text-gray-700 mb-4 flex items-center gap-2"
                >
                    <span>←</span> Back to Projects
                </button>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-sm text-gray-500">ID: {project.projectId}</p>
                    </div>
                </div>
                <DateRangePicker
                    startDate={startDate}
                    endDate={endDate}
                    onDateChange={handleDateChange}
                />
            </div>

            {statsQuery.isLoading ? (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading stats...</p>
                </div>
            ) : statsQuery.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800">Error loading stats</p>
                </div>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white border-2 border-black rounded-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Total Events</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.totalEvents.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white border-2 border-black rounded-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Unique Users</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.uniqueUsers.toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white border-2 border-black rounded-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Event Types</p>
                            <p className="text-3xl font-bold text-gray-900">
                                {stats.eventBreakdown.length}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <DailyActiveUsersChart
                            projectId={projectId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                        <EventBreakdownChart data={stats.eventBreakdown} />
                    </div>

                    <EventsTable
                        projectId={projectId}
                        filters={{
                            startDate,
                            endDate,
                        }}
                    />
                </>
            ) : null}
        </div>
    );
}
