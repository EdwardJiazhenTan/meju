"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MenuGenerationForm {
  user_name: string;
  start_date: string;
  end_date: string;
  period_type: "day" | "week";
}

interface GenerationResult {
  user_name: string;
  period_type: string;
  start_date: string;
  end_date: string;
  generated_meal_plans: any[];
  orders_processed: any[];
  summary: {
    total_orders: number;
    total_meals_generated: number;
    total_people_served: number;
  };
}

export default function MenuGenerationPage() {
  const [formData, setFormData] = useState<MenuGenerationForm>({
    user_name: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    period_type: "day",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 自动调整结束日期
    if (name === "start_date") {
      const startDate = new Date(value);
      if (formData.period_type === "week") {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        setFormData((prev) => ({
          ...prev,
          start_date: value,
          end_date: endDate.toISOString().split("T")[0],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          start_date: value,
          end_date: value,
        }));
      }
    }

    if (name === "period_type") {
      const startDate = new Date(formData.start_date);
      if (value === "week") {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        setFormData((prev) => ({
          ...prev,
          period_type: value as "day" | "week",
          end_date: endDate.toISOString().split("T")[0],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          period_type: value as "day" | "week",
          end_date: formData.start_date,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/menu-generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "生成菜单失败");
      }
    } catch (error) {
      console.error("Error generating menu:", error);
      setError("网络错误，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const getMealTypeText = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "早餐";
      case "lunch":
        return "午餐";
      case "dinner":
        return "晚餐";
      default:
        return mealType;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">菜单生成</h1>
          <p className="text-gray-600">根据订单自动生成用户菜单</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="user_name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  用户名称 *
                </label>
                <input
                  type="text"
                  id="user_name"
                  name="user_name"
                  required
                  value={formData.user_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入用户名称"
                />
              </div>

              <div>
                <label
                  htmlFor="period_type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  生成周期 *
                </label>
                <select
                  id="period_type"
                  name="period_type"
                  value={formData.period_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="day">单日菜单</option>
                  <option value="week">周菜单</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  开始日期 *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  结束日期 *
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  required
                  value={formData.end_date}
                  onChange={handleInputChange}
                  disabled={formData.period_type === "day"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isGenerating
                  ? "bg-gray-400 cursor-not-allowed text-gray-600"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isGenerating ? "生成中..." : "生成菜单"}
            </button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">生成结果</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.summary.total_orders}
                </div>
                <div className="text-sm text-blue-800">处理订单数</div>
              </div>
              <div className="bg-green-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.summary.total_meals_generated}
                </div>
                <div className="text-sm text-green-800">生成餐次数</div>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.summary.total_people_served}
                </div>
                <div className="text-sm text-purple-800">服务总人数</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                生成的菜单详情
              </h3>

              {result.generated_meal_plans.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  没有找到匹配的订单，未生成任何菜单
                </div>
              ) : (
                <div className="space-y-4">
                  {result.generated_meal_plans.map((mealPlan, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {new Date(mealPlan.date).toLocaleDateString("zh-CN")}{" "}
                          - {getMealTypeText(mealPlan.meal_type)}
                        </h4>
                        <div className="text-sm text-gray-500">
                          {mealPlan.people_count}人 | {mealPlan.orders_count}
                          个订单
                        </div>
                      </div>

                      <div className="space-y-2">
                        {mealPlan.dishes.map((dish: any, dishIndex: number) => (
                          <div
                            key={dishIndex}
                            className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                          >
                            <span className="font-medium">
                              {dish.dish_name}
                            </span>
                            <div className="text-sm text-gray-600">
                              {dish.people_count}人
                              {dish.notes && (
                                <span className="ml-2 text-gray-500">
                                  ({dish.notes})
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/meal-plan?user_name=${encodeURIComponent(result.user_name)}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                查看完整菜单
              </Link>
            </div>
          </div>
        )}

        <div className="mt-8 text-center space-x-4">
          <button
            onClick={() => router.push("/admin")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            返回后台
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={() => router.push("/admin/orders")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            查看订单
          </button>
        </div>
      </div>
    </div>
  );
}
