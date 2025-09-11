import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { Ingredient } from '@/types';

interface CreateIngredientData {
  name: string;
  calories_per_unit?: number;
  default_unit_id?: number;
  category?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateIngredientData = await request.json();
    
    const { name, calories_per_unit, default_unit_id, category } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO ingredients (name, calories_per_unit, default_unit_id, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, calories_per_unit, default_unit_id, category]
    );

    const ingredient = result.rows[0];

    return NextResponse.json({ ingredient }, { status: 201 });

  } catch (error) {
    console.error('Error creating ingredient:', error);
    return NextResponse.json(
      { error: 'Failed to create ingredient' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let queryText = `
      SELECT i.*, iu.name as unit_name, iu.abbreviation as unit_abbreviation
      FROM ingredients i
      LEFT JOIN ingredient_units iu ON i.default_unit_id = iu.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryText += ` AND i.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
    }

    if (category) {
      paramCount++;
      queryText += ` AND i.category = $${paramCount}`;
      params.push(category);
    }

    queryText += ' ORDER BY i.name ASC';

    const result = await query(queryText, params);
    const ingredients = result.rows;

    return NextResponse.json({ ingredients });

  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredients' },
      { status: 500 }
    );
  }
}