"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleStartOrder = () => {
    // Set default order info and go directly to order page
    const defaultOrderInfo = {
      user_name: "Guest",
      order_date: new Date().toISOString().split("T")[0],
      people_count: 1,
      notes: "",
    };

    sessionStorage.setItem("orderInfo", JSON.stringify(defaultOrderInfo));
    router.push("/order");
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
    </>
  );
}
