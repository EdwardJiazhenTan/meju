"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import WeeklyOrdersCalendar from "@/app/components/WeeklyOrdersCalendar";
import OrderDetailsModal from "@/app/components/OrderDetailsModal";

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

export default function MealPlanPage() {
  const [selectedOrderGroup, setSelectedOrderGroup] =
    useState<OrderGroup | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const weeklyCalendarRef = useRef<{ refreshData: () => void }>(null);

  // Get current week's Monday as start date
  const getCurrentWeekStart = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  // State for week navigation
  const [currentWeekStart, setCurrentWeekStart] = useState(
    getCurrentWeekStart(),
  );

  // Helper functions for week navigation
  const getWeekStart = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const navigateWeek = (direction: "previous" | "next") => {
    const current = new Date(currentWeekStart);
    const daysToAdd = direction === "next" ? 7 : -7;
    const newDate = new Date(
      current.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
    );
    setCurrentWeekStart(newDate.toISOString().split("T")[0]);
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getCurrentWeekStart());
  };

  const goToNextWeek = () => {
    const current = new Date(getCurrentWeekStart());
    const nextWeek = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
    setCurrentWeekStart(nextWeek.toISOString().split("T")[0]);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      const weekStart = getWeekStart(selectedDate);
      setCurrentWeekStart(weekStart);
    }
  };

  const formatWeekRange = (startDate: string) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
      });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const handleOrderGroupSelect = (
    orderGroup: OrderGroup,
    date: string,
    mealType: string,
  ) => {
    setSelectedOrderGroup(orderGroup);
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setIsOrderDetailsOpen(true);
  };

  const handleCloseOrderDetails = () => {
    setIsOrderDetailsOpen(false);
    setSelectedOrderGroup(null);
    setSelectedDate("");
    setSelectedMealType("");
    // Refresh data to show any status updates
    weeklyCalendarRef.current?.refreshData();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${
          isOrderDetailsOpen ? "blur-sm" : ""
        }`}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Weekly Orders Overview
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            View and manage customer orders for meal preparation
          </p>
          <p className="text-sm text-blue-600">
            Click on any dish group to see detailed order information and update
            status
          </p>
        </div>

        {/* Week Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigateWeek("previous")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>Previous Week</span>
            </button>

            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatWeekRange(currentWeekStart)}
              </div>
              <div className="text-sm text-gray-500">
                {currentWeekStart === getCurrentWeekStart() ? "This Week" : ""}
              </div>
            </div>

            <button
              onClick={() => navigateWeek("next")}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span>Next Week</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex justify-center items-center mt-4 space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={goToThisWeek}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                This Week
              </button>
              <button
                onClick={goToNextWeek}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Next Week
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <label htmlFor="week-picker" className="text-sm text-gray-600">
                Jump to date:
              </label>
              <input
                id="week-picker"
                type="date"
                onChange={handleDateChange}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Weekly Orders Calendar */}
        <div className="mb-8">
          <WeeklyOrdersCalendar
            ref={weeklyCalendarRef}
            startDate={currentWeekStart}
            onOrderGroupSelect={handleOrderGroupSelect}
          />
        </div>

        {/* Navigation Links */}
        <div className="max-w-md mx-auto">
          <div className="space-y-4">
            <Link
              href="/admin"
              className="block w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors text-center"
            >
              ← Back to Admin Dashboard
            </Link>
            <Link
              href="/admin/shopping-list"
              className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors text-center"
            >
              Generate Shopping List
            </Link>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderDetailsOpen}
        onClose={handleCloseOrderDetails}
        orderGroup={selectedOrderGroup}
        date={selectedDate}
        mealType={selectedMealType}
      />
    </div>
  );
}
