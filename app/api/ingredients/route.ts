import { NextRequest, NextResponse } from "next/server";
import { ingredientQueries } from "@/lib/database";
import { AuthHelper, requireAuth } from "@/lib/auth";

// Get all ingredients or search ingredients
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const searchQuery = url.searchParams.get("q");
    const category = url.searchParams.get("category");

    let ingredients;

    if (searchQuery) {
      // Search ingredients by name
      ingredients = ingredientQueries.searchIngredients(searchQuery);
    } else if (category) {
      // Filter by category
      ingredients = ingredientQueries.getIngredientsByCategory(category);
    } else {
      // Get all ingredients
      ingredients = ingredientQueries.getAllIngredients();
    }

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Ingredients retrieved successfully", { 
        ingredients,
        total: ingredients.length 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving ingredients:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}

// Create new ingredient (admin only for now)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Login required"),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, unit, category, calories_per_unit } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient name is required"),
        { status: 400 }
      );
    }

    // Validate category if provided
    const validCategories = ["vegetable", "meat", "dairy", "grain", "spice", "fruit", "other"];
    if (category && !validCategories.includes(category)) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Invalid ingredient category"),
        { status: 400 }
      );
    }

    // Check if ingredient already exists
    const existingIngredient = ingredientQueries.getIngredientByName(name);
    if (existingIngredient) {
      return NextResponse.json(
        AuthHelper.createErrorResponse("Ingredient already exists"),
        { status: 409 }
      );
    }

    // Create ingredient
    const ingredientData = {
      ingredient_key: name.toLowerCase().trim().replace(/\s+/g, '_'),
      name: name.toLowerCase().trim(),
      unit: unit || null,
      category: category || null,
      calories_per_unit: calories_per_unit || null,
    };

    const result = ingredientQueries.createIngredient(ingredientData);
    const ingredientId = result.lastInsertRowid as number;

    // Get created ingredient
    const newIngredient = ingredientQueries.getIngredientById(ingredientId);

    return NextResponse.json(
      AuthHelper.createSuccessResponse("Ingredient created successfully", {
        ingredient: newIngredient,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating ingredient:", error);
    return NextResponse.json(
      AuthHelper.createErrorResponse("Internal server error"),
      { status: 500 }
    );
  }
}