"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LandingPage from "@/components/LandingPage";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/meal-plan");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  if (!user && !showLogin) {
    return <LandingPage onLogin={() => setShowLogin(true)} />;
  }

  if (!user && showLogin) {
    return <LoginForm onBack={() => setShowLogin(false)} />;
  }

  return null; // Will redirect to meal-plan
}
