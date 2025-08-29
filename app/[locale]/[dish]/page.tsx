"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Navbar from "@/components/Navbar";

export interface DishDetail {
  dish_id: number;
  owner_id: number;
  name: string;
  descrtiption: string | null;
  calories: number | null;
  meal: "breakfast" | "lunch" | "dinner" | "dessert";
  special: boolean;
  url: string;
  visibility: "private" | "shared" | "public";
  prep_time: number | null;
  cook_time: number | null;
  created_at: string;
  updated_at: string;
}

export interface DishIngredient {
  name: string;
  unit: string | null;
  quantity: number;
}
// shows a specific dish's info
export default function DishView() {}
