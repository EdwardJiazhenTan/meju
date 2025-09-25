"use client";

import { useState } from "react";

export default function SearchOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("order_id");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    // TODO: Implement actual search functionality
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-2xl mx-auto px-6">
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
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50">
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
                    value="order_id"
                    checked={searchType === "order_id"}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="text-primary focus:ring-primary/50"
                  />
                  <span className="text-foreground">Order ID</span>
                </label>
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
                  searchType === "order_id"
                    ? "e.g., ORD-12345"
                    : "e.g., John Doe"
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

        {/* Search Results Placeholder */}
        <div className="mt-8 text-center">
          <div className="bg-muted/30 rounded-2xl p-8 border border-border/30">
            <div className="font-chinese text-xl text-muted-foreground mb-2">
              搜索结果将在这里显示
            </div>
            <p className="text-muted-foreground">
              Search results will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
