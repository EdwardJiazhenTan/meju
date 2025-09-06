"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import PublicNavbar from "@/components/PublicNavbar";

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar onLogin={onLogin} />
      <div className="flex flex-col items-center justify-center px-4 pt-16 pb-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold text-foreground mb-6">Meju</h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Your personal meal planning companion. Organize your weekly meals,
            create custom dishes, and make cooking easier with intelligent
            planning.
          </p>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              What is Meju?
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Meju is a comprehensive meal planning application that helps you
              organize your weekly meals, create and manage custom dishes with
              ingredients, and streamline your cooking process. Whether you're
              meal prepping for the week or just trying to stay organized in the
              kitchen, Meju makes it simple and efficient.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Meal Planning
              </h3>
              <p className="text-muted-foreground">
                Plan your weekly meals with an intuitive calendar interface
              </p>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Custom Dishes
              </h3>
              <p className="text-muted-foreground">
                Create and manage your favorite recipes with detailed
                ingredients
              </p>
            </div>

            <div className="text-center space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Smart Organization
              </h3>
              <p className="text-muted-foreground">
                OCR text recognition and intelligent categorization features
              </p>
            </div>
          </div>

          <div className="mt-16">
            <button
              onClick={onLogin}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
