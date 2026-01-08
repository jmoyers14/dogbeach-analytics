import { subDays } from "date-fns";

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onDateChange: (startDate: Date, endDate: Date) => void;
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
    const formatDateForInput = (date: Date) => {
        return date.toISOString().split('T')[0];
    };

    const handlePreset = (days: number) => {
        const end = new Date();
        const start = subDays(end, days);
        onDateChange(start, end);
    };

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStart = new Date(e.target.value);
        if (newStart <= endDate) {
            onDateChange(newStart, endDate);
        }
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEnd = new Date(e.target.value);
        if (newEnd >= startDate) {
            onDateChange(startDate, newEnd);
        }
    };

    return (
        <div className="border-2 border-black bg-white rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        id="startDate"
                        type="date"
                        value={formatDateForInput(startDate)}
                        onChange={handleStartChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        id="endDate"
                        type="date"
                        value={formatDateForInput(endDate)}
                        onChange={handleEndChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => handlePreset(7)}
                        className="px-3 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        Last 7 days
                    </button>
                    <button
                        onClick={() => handlePreset(30)}
                        className="px-3 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        Last 30 days
                    </button>
                    <button
                        onClick={() => handlePreset(90)}
                        className="px-3 py-2 bg-white border-2 border-black rounded-md hover:bg-gray-100 text-sm font-medium transition-colors"
                    >
                        Last 90 days
                    </button>
                </div>
            </div>
        </div>
    );
}
