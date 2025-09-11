import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { MealItem } from '@/types/database';

interface CreateMealItemData {
  dish_id: number;
  servings?: number;
  customizations?: Record<string, any>;
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const planId = parseInt(params.planId);
    const body: CreateMealItemData = await request.json();
    
    const { dish_id, servings = 1, customizations, notes } = body;

    if (!dish_id) {
      return NextResponse.json(
        { error: 'dish_id is required' },
        { status: 400 }
      );
    }

    // Check if meal plan exists
    const mealPlanCheck = await query('SELECT id FROM meal_plans WHERE id = $1', [planId]);
    if (mealPlanCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Check if dish exists
    const dishCheck = await query('SELECT id FROM dishes WHERE id = $1', [dish_id]);
    if (dishCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    // Create meal item
    const result = await query(
      `INSERT INTO meal_items (meal_plan_id, dish_id, servings, customizations, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [planId, dish_id, servings, JSON.stringify(customizations), notes]
    );

    const mealItem = result.rows[0];

    return NextResponse.json({ mealItem }, { status: 201 });

  } catch (error) {
    console.error('Error adding meal item:', error);
    return NextResponse.json(
      { error: 'Failed to add meal item' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const planId = parseInt(params.planId);

    // Check if meal plan exists
    const mealPlanCheck = await query('SELECT id FROM meal_plans WHERE id = $1', [planId]);
    if (mealPlanCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `SELECT 
         mi.*,
         d.name as dish_name,
         d.base_calories,
         d.preparation_time,
         d.category_id,
         c.name as category_name
       FROM meal_items mi
       JOIN dishes d ON mi.dish_id = d.id
       LEFT JOIN categories c ON d.category_id = c.id
       WHERE mi.meal_plan_id = $1
       ORDER BY d.name ASC`,
      [planId]
    );

    const mealItems = result.rows;

    return NextResponse.json({ mealItems });

  } catch (error) {
    console.error('Error fetching meal items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch meal items' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const planId = parseInt(params.planId);
    const body = await request.json();
    const { id, dish_id, servings, customizations, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Meal item ID is required' },
        { status: 400 }
      );
    }

    // Check if meal item exists and belongs to this meal plan
    const existingCheck = await query(
      'SELECT id FROM meal_items WHERE id = $1 AND meal_plan_id = $2',
      [id, planId]
    );

    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Meal item not found' },
        { status: 404 }
      );
    }

    // Build dynamic update query
    const updates = [];
    const queryParams: any[] = [];
    let paramCount = 0;

    if (dish_id !== undefined) {
      paramCount++;
      updates.push(`dish_id = $${paramCount}`);
      queryParams.push(dish_id);
    }

    if (servings !== undefined) {
      paramCount++;
      updates.push(`servings = $${paramCount}`);
      queryParams.push(servings);
    }

    if (customizations !== undefined) {
      paramCount++;
      updates.push(`customizations = $${paramCount}`);
      queryParams.push(JSON.stringify(customizations));
    }

    if (notes !== undefined) {
      paramCount++;
      updates.push(`notes = $${paramCount}`);
      queryParams.push(notes);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    paramCount++;
    queryParams.push(id);

    const result = await query(
      `UPDATE meal_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      queryParams
    );

    const mealItem = result.rows[0];

    return NextResponse.json({ mealItem });

  } catch (error) {
    console.error('Error updating meal item:', error);
    return NextResponse.json(
      { error: 'Failed to update meal item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { planId: string } }
) {
  try {
    const planId = parseInt(params.planId);
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'item_id parameter is required' },
        { status: 400 }
      );
    }

    // Check if meal item exists and belongs to this meal plan
    const existingCheck = await query(
      'SELECT id FROM meal_items WHERE id = $1 AND meal_plan_id = $2',
      [parseInt(itemId), planId]
    );

    if (existingCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Meal item not found' },
        { status: 404 }
      );
    }

    // Delete meal item
    await query('DELETE FROM meal_items WHERE id = $1', [parseInt(itemId)]);

    return NextResponse.json({ message: 'Meal item removed successfully' });

  } catch (error) {
    console.error('Error removing meal item:', error);
    return NextResponse.json(
      { error: 'Failed to remove meal item' },
      { status: 500 }
    );
  }
}