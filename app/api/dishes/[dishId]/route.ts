import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const dishId = parseInt(params.dishId);

    if (isNaN(dishId)) {
      return NextResponse.json(
        { error: 'Invalid dish ID' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT d.*, c.name as category_name
       FROM dishes d
       LEFT JOIN categories c ON d.category_id = c.id
       WHERE d.id = $1`,
      [dishId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    const dish = result.rows[0];

    return NextResponse.json({ dish });

  } catch (error) {
    console.error('Error fetching dish:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dish' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { dishId: string } }
) {
  try {
    const dishId = parseInt(params.dishId);
    const body = await request.json();

    if (isNaN(dishId)) {
      return NextResponse.json(
        { error: 'Invalid dish ID' },
        { status: 400 }
      );
    }

    const { name, cooking_steps, category_id, base_calories, preparation_time, servings, is_customizable } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE dishes
       SET name = $1, cooking_steps = $2, category_id = $3, base_calories = $4,
           preparation_time = $5, servings = $6, is_customizable = $7
       WHERE id = $8
       RETURNING *`,
      [name, cooking_steps, category_id, base_calories, preparation_time, servings, is_customizable, dishId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    const dish = result.rows[0];

    return NextResponse.json({ dish });

  } catch (error) {
    console.error('Error updating dish:', error);
    return NextResponse.json(
      { error: 'Failed to update dish' },
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

    if (isNaN(dishId)) {
      return NextResponse.json(
        { error: 'Invalid dish ID' },
        { status: 400 }
      );
    }

    const result = await query(
      'DELETE FROM dishes WHERE id = $1 RETURNING id',
      [dishId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Dish deleted successfully' });

  } catch (error) {
    console.error('Error deleting dish:', error);
    return NextResponse.json(
      { error: 'Failed to delete dish' },
      { status: 500 }
    );
  }
}
