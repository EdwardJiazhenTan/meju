import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/database";
import { CreateDishData, Dish } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: CreateDishData = await request.json();

    const {
      name,
      cooking_steps,
      category_id,
      base_calories,
      preparation_time,
      servings,
      is_customizable,
      ingredients,
    } = body;

    if (!name || !servings) {
      return NextResponse.json(
        { error: "Name and servings are required" },
        { status: 400 },
      );
    }

    const client = await query("BEGIN", []);

    try {
      const dishResult = await query(
        `INSERT INTO dishes (name, cooking_steps, category_id, base_calories, preparation_time, servings, is_customizable)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          name,
          cooking_steps,
          category_id,
          base_calories,
          preparation_time,
          servings,
          is_customizable,
        ],
      );

      const dish = dishResult.rows[0];

      if (ingredients && ingredients.length > 0) {
        for (const ingredient of ingredients) {
          await query(
            `INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit_id, is_optional)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              dish.id,
              ingredient.ingredient_id,
              ingredient.quantity,
              ingredient.unit_id,
              ingredient.is_optional,
            ],
          );
        }
      }

      await query("COMMIT", []);

      return NextResponse.json({ dish }, { status: 201 });
    } catch (error) {
      await query("ROLLBACK", []);
      throw error;
    }
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Failed to create dish" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let queryText = `
      SELECT d.*, c.name as category_name
      FROM dishes d
      LEFT JOIN categories c ON d.category_id = c.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      queryText += ` AND c.name = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      queryText += ` AND (d.name ILIKE $${paramCount} OR d.cooking_steps ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    queryText += " ORDER BY d.created_at DESC";

    const result = await query(queryText, params);
    const dishes = result.rows;

    // Fetch ingredients for each dish
    const dishesWithIngredients = await Promise.all(
      dishes.map(async (dish: any) => {
        const ingredientsResult = await query(
          `SELECT di.*, i.name as ingredient_name, iu.name as unit_name, iu.abbreviation as unit_abbreviation
           FROM dish_ingredients di
           JOIN ingredients i ON di.ingredient_id = i.id
           JOIN ingredient_units iu ON di.unit_id = iu.id
           WHERE di.dish_id = $1
           ORDER BY di.id`,
          [dish.id],
        );

        return {
          ...dish,
          ingredients: ingredientsResult.rows,
        };
      }),
    );

    return NextResponse.json({ dishes: dishesWithIngredients });
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Failed to fetch dishes" },
      { status: 500 },
    );
  }
}
