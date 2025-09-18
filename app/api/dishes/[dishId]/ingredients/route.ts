import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { DishIngredient } from '@/types';

// TODO: params should be awaited before using its properties. 
interface CreateDishIngredientData {
  ingredient_id: number;
  quantity: number;
  unit_id: number;
  is_optional?: boolean;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const dishId = parseInt(params.dishId);
    const body: CreateDishIngredientData = await request.json();

    const { ingredient_id, quantity, unit_id, is_optional = false } = body;

    if (!ingredient_id || !quantity || !unit_id) {
      return NextResponse.json(
        { error: 'ingredient_id, quantity, and unit_id are required' },
        { status: 400 }
      );
    }

    // Check if dish exists
    const dishCheck = await query('SELECT id FROM dishes WHERE id = $1', [dishId]);
    if (dishCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit_id, is_optional)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [dishId, ingredient_id, quantity, unit_id, is_optional]
    );

    const dishIngredient = result.rows[0];

    return NextResponse.json({ dishIngredient }, { status: 201 });

  } catch (error) {
    console.error('Error adding dish ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to add dish ingredient' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const dishId = parseInt(params.dishId);

    const result = await query(
      `SELECT 
         di.*,
         i.name as ingredient_name,
         i.calories_per_unit,
         i.category as ingredient_category,
         iu.name as unit_name,
         iu.abbreviation as unit_abbreviation
       FROM dish_ingredients di
       JOIN ingredients i ON di.ingredient_id = i.id
       JOIN ingredient_units iu ON di.unit_id = iu.id
       WHERE di.dish_id = $1
       ORDER BY di.is_optional ASC, i.name ASC`,
      [dishId]
    );

    const ingredients = result.rows;

    return NextResponse.json({ ingredients });

  } catch (error) {
    console.error('Error fetching dish ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dish ingredients' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const dishId = parseInt(params.dishId);
    const { searchParams } = new URL(request.url);
    const ingredientId = searchParams.get('ingredient_id');

    if (!ingredientId) {
      return NextResponse.json(
        { error: 'ingredient_id parameter is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `DELETE FROM dish_ingredients 
       WHERE dish_id = $1 AND ingredient_id = $2
       RETURNING *`,
      [dishId, parseInt(ingredientId)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish ingredient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Dish ingredient removed successfully' });

  } catch (error) {
    console.error('Error removing dish ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to remove dish ingredient' },
      { status: 500 }
    );
  }
}
