"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/Navbar";
import DishForm from "@/components/DishForm";

export default function CreateDishPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/${locale}/`);
    }
  }, [user, loading, router, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground">{t("common.loading")}</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 px-4">
        <div className="mb-6 justify-center  items-center">
          <h1 className="text-2xl flex items-center font-bold text-foreground">
            {t("dish.createTitle")}
          </h1>
          <p className="text-foreground mt-1">{t("dish.createDescription")}</p>
        </div>
        <DishForm />
      </div>
    </div>
  );
}
