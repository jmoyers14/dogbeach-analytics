import { useQuery } from "@tanstack/react-query";
import { trpc } from "../trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DailyActiveUsersChartProps {
    projectId: string;
    startDate: Date;
    endDate: Date;
}

export function DailyActiveUsersChart({ projectId, startDate, endDate }: DailyActiveUsersChartProps) {
    const dauQuery = useQuery(
        trpc.projects.dailyActiveUsers.queryOptions({
            projectId,
            startDate,
            endDate,
        })
    );

    if (dauQuery.isLoading) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">Loading chart...</p>
                </div>
            </div>
        );
    }

    if (dauQuery.error) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">Error loading chart data</p>
                </div>
            </div>
        );
    }

    const data = dauQuery.data || [];

    if (data.length === 0) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">No data for selected date range</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-black rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Active Users</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        stroke="#000"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#000"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #000',
                            borderRadius: '0.5rem'
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#000"
                        strokeWidth={2}
                        dot={{ fill: '#000', r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
