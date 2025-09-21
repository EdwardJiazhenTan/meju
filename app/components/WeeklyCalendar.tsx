"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MealItem {
  id: number;
  dish_id: number;
  dish_name: string;
  servings: number;
  customizations?: Record<string, any>;
  notes?: string;
  base_calories?: number;
  preparation_time?: number;
}

interface MealPlan {
  id: number;
  meal_name: string;
  date: string;
  created_at: string;
  items: MealItem[];
}

interface WeeklyData {
  week_start: string;
  days: Record<string, Record<string, MealPlan>>;
}

interface WeeklyCalendarProps {
  startDate: string; // YYYY-MM-DD format
  onMealPlanSelect?: (mealPlan: MealPlan) => void;
}

const WeeklyCalendar = forwardRef<
  { refreshData: () => void },
  WeeklyCalendarProps
>(({ startDate, onMealPlanSelect }, ref) => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/meal-plans/week?start_date=${startDate}`,
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch weekly meal plan");
      }

      setWeeklyData(result.weeklyMealPlan);
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
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  const generateWeeklyPDF = async (weeklyData: WeeklyData | null, startDate: string) => {
    if (!weeklyData) {
      alert("No meal plan data available");
      return;
    }

    try {
      const pdf = new jsPDF();

      // Get all unique dish IDs from the meal plan
      const dishIds = new Set<number>();
      Object.values(weeklyData.days).forEach(day => {
        Object.values(day).forEach(meal => {
          meal.items.forEach(item => {
            dishIds.add(item.dish_id);
          });
        });
      });

      // Fetch ingredients for all dishes
      const dishIngredients: Record<number, any[]> = {};
      for (const dishId of dishIds) {
        try {
          const response = await fetch(`/api/dishes/${dishId}/ingredients`);
          const result = await response.json();
          if (response.ok) {
            dishIngredients[dishId] = result.ingredients || [];
          }
        } catch (error) {
          console.error(`Failed to fetch ingredients for dish ${dishId}:`, error);
          dishIngredients[dishId] = [];
        }
      }

      // Title
      autoTable(pdf, {
        head: [[`Weekly Meal Plan - Week of ${startDate}`]],
        body: [],
        theme: 'plain',
        styles: {
          fontSize: 16,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 10
        },
        headStyles: { fillColor: [255, 140, 0] },
        margin: { top: 20 }
      });

      // Prepare table data
      const tableData: string[][] = [];
      const weekDates = generateWeekDates(startDate);
      const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

      weekDates.forEach((date, dayIndex) => {
        const dayData = weeklyData.days[date];

        // Add day header
        tableData.push([`${dayNames[dayIndex]} - ${date}`, '', '', '']);

        mealTypes.forEach(mealType => {
          const mealPlan = dayData?.[mealType];
          const mealHeader = mealType.charAt(0).toUpperCase() + mealType.slice(1);

          if (mealPlan && mealPlan.items.length > 0) {
            mealPlan.items.forEach((item, itemIndex) => {
              const dishName = `${item.dish_name}${item.servings > 1 ? ` (${item.servings} servings)` : ''}`;
              const ingredients = dishIngredients[item.dish_id] || [];

              let ingredientsList = '';
              if (ingredients.length > 0) {
                ingredientsList = ingredients.map(ingredient => {
                  const quantity = ingredient.quantity * item.servings;
                  return `${quantity} ${ingredient.unit_abbreviation || ingredient.unit_name} ${ingredient.ingredient_name}`;
                }).join(', ');
              }

              const notes = item.notes || '';

              if (itemIndex === 0) {
                tableData.push([mealHeader, dishName, ingredientsList, notes]);
              } else {
                tableData.push(['', dishName, ingredientsList, notes]);
              }
            });
          } else {
            tableData.push([mealHeader, 'No dishes planned', '', '']);
          }
        });

        // Add spacing between days
        tableData.push(['', '', '', '']);
      });

      // Generate table with Unicode support
      autoTable(pdf, {
        head: [['Meal Type', 'Dish', 'Ingredients', 'Notes']],
        body: tableData,
        startY: (pdf as any).lastAutoTable.finalY + 10,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap'
        },
        headStyles: {
          fillColor: [255, 140, 0],
          fontStyle: 'bold',
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          1: { cellWidth: 40 },
          2: { cellWidth: 80 },
          3: { cellWidth: 35 }
        },
        theme: 'striped',
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 20, bottom: 20 }
      });

      // Save the PDF
      const fileName = `Weekly_Meal_Plan_${startDate}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Loading weekly meal plan...</div>
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
      <div className="px-8 py-6 bg-orange-600 text-white">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Weekly Meal Plan</h2>
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
                  className="px-6 py-4 text-left text-lg font-semibold text-gray-700 min-w-40"
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
                  const mealPlan = dayData?.[mealType];

                  return (
                    <td
                      key={`${date}-${mealType}`}
                      className="px-6 py-4 border-l"
                    >
                      <div
                        className="cursor-pointer hover:bg-blue-50 p-4 rounded border-2 border-transparent hover:border-blue-200 transition-colors h-[120px] overflow-y-auto meal-cell-scroll"
                        onClick={() => {
                          if (mealPlan) {
                            onMealPlanSelect?.(mealPlan);
                          } else {
                            // Create a placeholder meal plan for new meals
                            onMealPlanSelect?.({
                              id: 0, // Will be created when needed
                              meal_name: mealType,
                              date: date,
                              created_at: new Date().toISOString(),
                              items: [],
                            });
                          }
                        }}
                      >
                        <div className="h-full flex flex-col">
                          {mealPlan ? (
                            <>
                              {mealPlan.items.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                  <div className="text-center text-gray-400 text-sm italic">
                                    <svg
                                      className="w-6 h-6 mx-auto mb-1 text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      />
                                    </svg>
                                    <div>Add dishes</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex-1 overflow-y-auto">
                                  <div className="space-y-2">
                                    {mealPlan.items.map((item) => (
                                      <div key={item.id} className="text-sm border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                                        <div className="font-medium text-gray-900 leading-tight">
                                          {item.dish_name}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          {item.servings !== 1 &&
                                            `${item.servings}x • `}
                                          {item.base_calories &&
                                            `${Math.round(item.base_calories * item.servings)} cal`}
                                          {item.preparation_time &&
                                            ` • ${item.preparation_time}min`}
                                        </div>
                                        {item.notes && (
                                          <div className="text-xs text-blue-600 italic mt-1">
                                            {item.notes}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex-1 flex items-center justify-center">
                              <div className="text-center text-gray-300 text-sm italic">
                                <svg
                                  className="w-6 h-6 mx-auto mb-1 text-gray-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                  />
                                </svg>
                                <div>Plan meal</div>
                              </div>
                            </div>
                          )}
                        </div>
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
            Click on any meal slot to plan dishes
          </span>
          <div className="flex space-x-4">
            <button
              onClick={fetchWeeklyData}
              className="text-orange-600 hover:text-orange-700 underline text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => generateWeeklyPDF(weeklyData, startDate)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Generate PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

WeeklyCalendar.displayName = "WeeklyCalendar";

export default WeeklyCalendar;
