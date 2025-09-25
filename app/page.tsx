"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderModalData {
  user_name: string;
  order_date: string;
  people_count: number;
  notes: string;
}

export default function HomePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<OrderModalData>({
    user_name: "",
    order_date: new Date().toISOString().split("T")[0],
    people_count: 1,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartOrder = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset form data
    setModalData({
      user_name: "",
      order_date: new Date().toISOString().split("T")[0],
      people_count: 1,
      notes: "",
    });
  };

  const handleInputChange = (
    field: keyof OrderModalData,
    value: string | number,
  ) => {
    setModalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewDishes = async () => {
    if (!modalData.user_name.trim()) {
      alert("Please enter your name");
      return;
    }

    setIsSubmitting(true);
    // Store order info in session storage for the order page
    sessionStorage.setItem("orderInfo", JSON.stringify(modalData));

    // Navigate to order page with the order info
    router.push("/order");
    setIsSubmitting(false);
  };

  return (
    <>
      {/* Main landing page */}
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/8 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/6 rounded-full blur-3xl"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Main heading */}
          <div className="mb-12">
            <h1 className="heading-massive font-english text-primary mb-6 fade-in-up">
              Welcome to
            </h1>
            <h2 className="heading-xl font-english text-foreground mb-4 fade-in-up-delay">
              Tekindar Restaurant
            </h2>
            <div className="font-chinese text-3xl md:text-5xl text-foreground mb-8 fade-in-up-delay">
              欢迎来到狂狂餐厅
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed fade-in-up-delay font-body">
              Experience the finest culinary journey with our carefully curated
              dishes, prepared with passion and served with elegance.
            </p>
          </div>

          {/* CTA Button */}
          <div className="fade-in-up-delay">
            <button
              onClick={handleStartOrder}
              className="btn-elegant text-lg px-8 py-4 elegant-hover"
            >
              Start Order Now
            </button>
          </div>

          {/* Decorative line */}
          <div className="mt-16 flex items-center justify-center">
            <div className="w-24 h-px bg-primary/50"></div>
            <div className="mx-4 w-2 h-2 bg-primary rounded-full"></div>
            <div className="w-24 h-px bg-primary/50"></div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0 blur-backdrop"
            onClick={handleCloseModal}
          ></div>

          {/* Modal content */}
          <div className="relative bg-card/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 elegant-shadow-lg border border-border/50">
            {/* Modal header */}
            <div className="text-center mb-8">
              <h3 className="font-english text-2xl text-primary mb-2">
                Order Information
              </h3>
              <p className="font-chinese text-lg text-foreground">订餐信息</p>
              <div className="w-16 h-px bg-primary mx-auto mt-4"></div>
            </div>

            {/* Form */}
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 tracking-wide">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={modalData.user_name}
                  onChange={(e) =>
                    handleInputChange("user_name", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground placeholder-muted-foreground"
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 tracking-wide">
                  Order Date *
                </label>
                <input
                  type="date"
                  value={modalData.order_date}
                  onChange={(e) =>
                    handleInputChange("order_date", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground"
                />
              </div>

              {/* People count */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 tracking-wide">
                  Number of People *
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={modalData.people_count}
                  onChange={(e) =>
                    handleInputChange("people_count", parseInt(e.target.value))
                  }
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition text-foreground"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2 tracking-wide">
                  Special Notes
                </label>
                <textarea
                  rows={3}
                  value={modalData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary smooth-transition resize-none text-foreground placeholder-muted-foreground"
                  placeholder="Any special requests or dietary requirements..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleCloseModal}
                className="btn-outline-elegant flex-1 py-3"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleViewDishes}
                disabled={isSubmitting || !modalData.user_name.trim()}
                className="btn-elegant flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Loading..." : "View Dishes"}
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground smooth-transition rounded-full hover:bg-secondary"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
