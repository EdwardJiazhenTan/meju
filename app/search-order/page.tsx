"use client";

import { useState } from "react";

interface Order {
  id: number;
  user_name: string;
  order_date: string;
  meal_type: string;
  dish_name: string;
  people_count: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed";
  created_at: string;
}

export default function SearchOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("user_name");
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchPerformed(true);

    try {
      const params = new URLSearchParams();

      if (searchType === "user_name") {
        params.append("user_name", searchQuery.trim());
      } else if (searchType === "order_id") {
        // For order ID, we'll need to modify the API or search by ID
        params.append("id", searchQuery.trim());
      }

      const response = await fetch(`/api/orders?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        console.error("Search failed:", data.error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error searching orders:", error);
      setOrders([]);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "confirmed":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getMealTypeDisplay = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-english text-5xl md:text-6xl text-primary mb-4">
            Search Order
          </h1>
          <div className="font-chinese text-2xl md:text-3xl text-foreground mb-8">
            查询订单
          </div>
          <div className="w-24 h-px bg-primary mx-auto"></div>
        </div>

        {/* Search Form */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 max-w-2xl mx-auto mb-8">
          <div className="space-y-6">
            {/* Search Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3 tracking-wide">
                Search By
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="user_name"
                    checked={searchType === "user_name"}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="text-primary focus:ring-primary/50"
                  />
                  <span className="text-foreground">Customer Name</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value="order_id"
                    checked={searchType === "order_id"}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="text-primary focus:ring-primary/50"
                  />
                  <span className="text-foreground">Order ID</span>
                </label>
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2 tracking-wide">
                {searchType === "order_id"
                  ? "Enter Order ID"
                  : "Enter Customer Name"}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground placeholder-muted-foreground"
                placeholder={
                  searchType === "order_id" ? "e.g., 123" : "e.g., John Doe"
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full btn-elegant py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching..." : "Search Order"}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchPerformed && (
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="font-chinese text-xl text-muted-foreground mb-2">
                  未找到订单
                </div>
                <p className="text-muted-foreground mb-4">
                  No orders found for "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Please check the spelling or try a different search term.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-english text-2xl text-foreground">
                    Search Results
                  </h2>
                  <span className="text-muted-foreground">
                    {orders.length} {orders.length === 1 ? "order" : "orders"}{" "}
                    found
                  </span>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-background/50 rounded-lg border border-border/30 p-6 hover:border-primary/50 smooth-transition"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <h3 className="font-english text-lg text-foreground font-medium">
                              Order #{order.id}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getStatusColor(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex">
                              <span className="text-muted-foreground w-20">
                                Customer:
                              </span>
                              <span className="text-foreground font-medium">
                                {order.user_name}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-muted-foreground w-20">
                                Date:
                              </span>
                              <span className="text-foreground">
                                {formatDate(order.order_date)}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-muted-foreground w-20">
                                Meal:
                              </span>
                              <span className="text-foreground">
                                {getMealTypeDisplay(order.meal_type)}
                              </span>
                            </div>
                            <div className="flex">
                              <span className="text-muted-foreground w-20">
                                People:
                              </span>
                              <span className="text-foreground">
                                {order.people_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">
                              Dish Ordered:
                            </h4>
                            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                              <p className="font-english text-foreground font-medium">
                                {order.dish_name}
                              </p>
                            </div>
                          </div>

                          {order.notes && (
                            <div>
                              <h4 className="text-sm font-medium text-foreground mb-2">
                                Notes:
                              </h4>
                              <p className="text-sm text-muted-foreground italic">
                                {order.notes}
                              </p>
                            </div>
                          )}

                          <div className="pt-2 border-t border-border/30">
                            <p className="text-xs text-muted-foreground">
                              Created: {formatDateTime(order.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-8 pt-6 border-t border-border/30 text-center">
                  <p className="text-muted-foreground">
                    Showing all orders for "{searchQuery}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="text-center mt-16 pt-8 border-t border-border/50">
          <a
            href="/"
            className="text-muted-foreground hover:text-primary smooth-transition font-medium flex items-center justify-center space-x-2"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Return to Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
