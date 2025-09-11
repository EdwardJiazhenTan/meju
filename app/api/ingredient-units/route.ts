import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { IngredientUnit } from '@/types';

interface CreateIngredientUnitData {
  name: string;
  abbreviation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateIngredientUnitData = await request.json();
    
    const { name, abbreviation } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO ingredient_units (name, abbreviation)
       VALUES ($1, $2)
       RETURNING *`,
      [name, abbreviation]
    );

    const unit = result.rows[0];

    return NextResponse.json({ unit }, { status: 201 });

  } catch (error) {
    console.error('Error creating ingredient unit:', error);
    return NextResponse.json(
      { error: 'Failed to create ingredient unit' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await query(
      `SELECT * FROM ingredient_units 
       ORDER BY name ASC`
    );

    const units = result.rows;

    return NextResponse.json({ units });

  } catch (error) {
    console.error('Error fetching ingredient units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ingredient units' },
      { status: 500 }
    );
  }
}