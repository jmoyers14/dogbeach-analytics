import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface EventBreakdownChartProps {
    data: Array<{ name: string; count: number }>;
}

export function EventBreakdownChart({ data }: EventBreakdownChartProps) {
    const topEvents = data.slice(0, 10);

    if (topEvents.length === 0) {
        return (
            <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown</h3>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">No events recorded</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-black rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Breakdown (Top 10)</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topEvents}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        stroke="#000"
                        style={{ fontSize: '12px' }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
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
                    <Bar
                        dataKey="count"
                        fill="#000"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
