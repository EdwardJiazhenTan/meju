"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

interface OrderDetails {
  id: number;
  user_name: string;
  people_count: number;
  notes?: string;
  status: string;
  created_at: string;
}

interface OrderGroup {
  dish_name: string;
  orders: OrderDetails[];
  total_people: number;
  total_orders: number;
}

interface WeeklyOrders {
  week_start: string;
  days: Record<string, Record<string, OrderGroup[]>>;
}

interface WeeklyOrdersCalendarProps {
  startDate: string; // YYYY-MM-DD format
  onOrderGroupSelect?: (orderGroup: OrderGroup, date: string, mealType: string) => void;
}

const WeeklyOrdersCalendar = forwardRef<
  { refreshData: () => void },
  WeeklyOrdersCalendarProps
>(({ startDate, onOrderGroupSelect }, ref) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyOrders | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/orders/week?start_date=${startDate}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch weekly orders");
      }

      setWeeklyData(result.weeklyOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate) {
      fetchWeeklyData();
    }
  }, [startDate]);

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refreshData: fetchWeeklyData,
  }));

  // Generate 7 days from start date
  const generateWeekDates = (startDate: string): string[] => {
    const dates = [];
    const start = new Date(startDate);

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  };

  const weekDates = generateWeekDates(startDate);
  const dayNames = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const mealTypes = ["breakfast", "lunch", "dinner"];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading weekly orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
        <button onClick={fetchWeeklyData} className="ml-4 text-sm underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full">
      <div className="px-8 py-6 bg-blue-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Weekly Orders Overview</h2>
          <span className="text-lg">Week of {startDate}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">
                Meal
              </th>
              {weekDates.map((date, index) => (
                <th
                  key={date}
                  className="px-6 py-4 text-left text-lg font-semibold text-gray-700 min-w-64"
                >
                  <div>{dayNames[index]}</div>
                  <div className="text-sm text-gray-500">{date}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((mealType) => (
              <tr key={mealType} className="border-t">
                <td className="px-6 py-4 font-semibold text-lg text-gray-900 capitalize bg-gray-50">
                  {mealType}
                </td>
                {weekDates.map((date) => {
                  const dayData = weeklyData?.days[date];
                  const orderGroups = dayData?.[mealType] || [];

                  return (
                    <td
                      key={`${date}-${mealType}`}
                      className="px-6 py-4 border-l align-top"
                    >
                      <div className="min-h-[120px] max-h-[200px] overflow-y-auto space-y-2">
                        {orderGroups.length === 0 ? (
                          <div className="flex items-center justify-center h-[120px]">
                            <div className="text-center text-gray-300 text-sm italic">
                              <svg
                                className="w-6 h-6 mx-auto mb-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                />
                              </svg>
                              No orders
                            </div>
                          </div>
                        ) : (
                          orderGroups.map((orderGroup, groupIndex) => (
                            <div
                              key={groupIndex}
                              className="bg-gray-50 rounded-lg p-3 border hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => onOrderGroupSelect?.(orderGroup, date, mealType)}
                            >
                              <div className="font-medium text-gray-900 text-sm mb-1">
                                {orderGroup.dish_name}
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {orderGroup.total_orders} order{orderGroup.total_orders !== 1 ? 's' : ''} • {orderGroup.total_people} people
                              </div>
                              <div className="space-y-1 max-h-16 overflow-y-auto">
                                {orderGroup.orders.slice(0, 3).map((order, orderIndex) => (
                                  <div key={orderIndex} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-700 truncate">
                                      {order.user_name} ({order.people_count})
                                    </span>
                                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                      {order.status}
                                    </span>
                                  </div>
                                ))}
                                {orderGroup.orders.length > 3 && (
                                  <div className="text-xs text-gray-500 italic">
                                    +{orderGroup.orders.length - 3} more...
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-6 bg-gray-50 border-t">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-lg">
            Click on any dish group to view detailed orders
          </span>
          <button
            onClick={fetchWeeklyData}
            className="text-blue-600 hover:text-blue-700 underline text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
});

WeeklyOrdersCalendar.displayName = "WeeklyOrdersCalendar";

export default WeeklyOrdersCalendar;
