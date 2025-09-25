"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OrderForm from "../components/OrderForm";

interface OrderFormData {
  user_name: string;
  order_date: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  dish_name: string;
  people_count: number;
  notes: string;
}

interface OrderInfo {
  user_name: string;
  order_date: string;
  people_count: number;
  notes: string;
}

export default function OrderPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [initialData, setInitialData] = useState<Partial<OrderFormData>>({});
  const router = useRouter();

  // Load order info from session storage
  useEffect(() => {
    const orderInfoStr = sessionStorage.getItem("orderInfo");
    if (orderInfoStr) {
      try {
        const orderInfo: OrderInfo = JSON.parse(orderInfoStr);
        setInitialData({
          user_name: orderInfo.user_name,
          order_date: orderInfo.order_date,
          people_count: orderInfo.people_count,
          notes: orderInfo.notes,
        });
      } catch (error) {
        console.error("Error parsing order info:", error);
      }
    }
  }, []);

  const handleOrderSubmit = async (orderData: OrderFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    // Validate dish selection
    if (!orderData.dish_name || orderData.dish_name.trim() === "") {
      setMessage({
        type: "error",
        text: "Please select a dish first!",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Order submitted successfully!",
        });

        // Clear session storage
        sessionStorage.removeItem("orderInfo");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/my-orders");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to submit order",
        });
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setMessage({
        type: "error",
        text: "Network error, please try again",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-english text-4xl md:text-5xl text-primary mb-4">
            Create Your Order
          </h1>
          <div className="font-chinese text-xl md:text-2xl text-foreground mb-6">
            创建您的订单
          </div>
          <div className="w-24 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select your favorite dishes and complete your dining experience
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div
            className={`mb-8 p-4 rounded-lg border backdrop-blur-sm ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-red-500/10 border-red-500/30 text-red-400"
            }`}
          >
            <div className="flex items-center space-x-3">
              {message.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Order Form */}
        <div className="mb-8">
          <OrderForm
            onSubmit={handleOrderSubmit}
            isSubmitting={isSubmitting}
            initialData={initialData}
          />
        </div>

        {/* Navigation Links */}
        <div className="text-center pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
            <button
              onClick={() => router.push("/")}
              className="text-muted-foreground hover:text-primary smooth-transition font-medium flex items-center space-x-2"
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
            </button>
            <div className="hidden sm:block w-px h-6 bg-border/50"></div>
            <button
              onClick={() => router.push("/my-orders")}
              className="text-muted-foreground hover:text-primary smooth-transition font-medium flex items-center space-x-2"
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
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8h6m-6 4h6"
                />
              </svg>
              <span>View All Orders</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
