"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderConfirmation {
  orderIds: number[];
  orderInfo: {
    user_name: string;
    order_date: string;
    people_count: number;
    notes: string;
  };
  orderItems: {
    dishName: string;
    quantity: number;
  }[];
}

export default function OrderConfirmationPage() {
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const confirmationStr = sessionStorage.getItem("orderConfirmation");
    if (confirmationStr) {
      try {
        const data: OrderConfirmation = JSON.parse(confirmationStr);
        setConfirmation(data);
      } catch (error) {
        console.error("Error parsing order confirmation:", error);
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setLoading(false);
  }, [router]);

  const clearConfirmation = () => {
    sessionStorage.removeItem("orderConfirmation");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (!confirmation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No order confirmation found.</p>
          <Link href="/" className="btn-elegant">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = confirmation.orderItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary/6 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        {/* Success Header */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="font-english text-5xl md:text-6xl text-primary mb-4">
            Order Confirmed!
          </h1>
          <div className="font-chinese text-2xl md:text-3xl text-foreground mb-8">
            订单确认成功！
          </div>
          <div className="w-24 h-px bg-primary mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">
            Thank you for your order. We've received your request and will prepare it with care.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 border border-border/50 mb-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Information */}
            <div>
              <h2 className="font-english text-2xl text-foreground mb-6">Order Information</h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Customer Name</span>
                  <span className="text-foreground font-medium">{confirmation.orderInfo.user_name}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="text-foreground font-medium">
                    {new Date(confirmation.orderInfo.order_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">People Count</span>
                  <span className="text-foreground font-medium">
                    {confirmation.orderInfo.people_count} {confirmation.orderInfo.people_count === 1 ? 'person' : 'people'}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-border/30">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="text-foreground font-medium">{totalItems}</span>
                </div>

                {confirmation.orderInfo.notes && (
                  <div className="py-2">
                    <span className="text-muted-foreground block mb-2">Special Notes</span>
                    <span className="text-foreground bg-muted/30 p-3 rounded-lg block">
                      {confirmation.orderInfo.notes}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Numbers and Items */}
            <div>
              <h2 className="font-english text-2xl text-foreground mb-6">Order Numbers & Items</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-primary/10 rounded-lg p-4">
                  <span className="text-muted-foreground block mb-2">Your Order Numbers</span>
                  <div className="flex flex-wrap gap-2">
                    {confirmation.orderIds.map((id, index) => (
                      <span
                        key={id}
                        className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                      >
                        #{id}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Save these numbers for order tracking and pickup
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-muted-foreground block mb-3">Ordered Items</span>
                {confirmation.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border/20 last:border-b-0">
                    <span className="text-foreground">{item.dishName}</span>
                    <span className="text-muted-foreground">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-card/30 backdrop-blur-sm rounded-2xl p-8 border border-border/30 mb-12">
          <h2 className="font-english text-2xl text-foreground mb-6 text-center">What's Next?</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-foreground font-medium mb-2">We're Preparing</h3>
              <p className="text-muted-foreground text-sm">Your order is being prepared with fresh ingredients</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h0v14z" />
                </svg>
              </div>
              <h3 className="text-foreground font-medium mb-2">Ready Soon</h3>
              <p className="text-muted-foreground text-sm">We'll notify you when your order is ready for pickup</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-foreground font-medium mb-2">Enjoy!</h3>
              <p className="text-muted-foreground text-sm">Pick up your delicious meal and enjoy</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/search-order"
            className="btn-elegant bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Track Your Order
          </Link>

          <button
            onClick={clearConfirmation}
            className="btn-elegant bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            Place Another Order
          </button>

          <Link
            href="/my-orders"
            className="text-muted-foreground hover:text-primary smooth-transition font-medium"
          >
            View Order History
          </Link>
        </div>
      </div>
    </div>
  );
}
