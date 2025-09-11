import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/database';
import { CustomizationGroup, CustomizationOption } from '@/types';

interface CreateCustomizationGroupData {
  dish_id: number;
  name: string;
  type: 'single' | 'multiple' | 'quantity';
  is_required?: boolean;
  display_order?: number;
  options: {
    ingredient_id: number;
    name: string;
    default_quantity?: number;
    unit_id?: number;
    display_order?: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCustomizationGroupData = await request.json();
    
    const { dish_id, name, type, is_required = false, display_order, options } = body;

    if (!dish_id || !name || !type) {
      return NextResponse.json(
        { error: 'dish_id, name, and type are required' },
        { status: 400 }
      );
    }

    if (!['single', 'multiple', 'quantity'].includes(type)) {
      return NextResponse.json(
        { error: 'type must be single, multiple, or quantity' },
        { status: 400 }
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

    // Start transaction
    await query('BEGIN');

    try {
      // Create customization group
      const groupResult = await query(
        `INSERT INTO customization_groups (dish_id, name, type, is_required, display_order)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [dish_id, name, type, is_required, display_order]
      );

      const group = groupResult.rows[0];

      // Create customization options
      const createdOptions = [];
      if (options && options.length > 0) {
        for (const option of options) {
          const optionResult = await query(
            `INSERT INTO customization_options (group_id, ingredient_id, name, default_quantity, unit_id, display_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [group.id, option.ingredient_id, option.name, option.default_quantity, option.unit_id, option.display_order]
          );
          createdOptions.push(optionResult.rows[0]);
        }
      }

      await query('COMMIT');

      return NextResponse.json({ 
        group: {
          ...group,
          options: createdOptions
        }
      }, { status: 201 });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating customization group:', error);
    return NextResponse.json(
      { error: 'Failed to create customization group' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dishId = searchParams.get('dish_id');

    let queryText = `
      SELECT 
        cg.*,
        json_agg(
          json_build_object(
            'id', co.id,
            'ingredient_id', co.ingredient_id,
            'name', co.name,
            'default_quantity', co.default_quantity,
            'unit_id', co.unit_id,
            'display_order', co.display_order,
            'ingredient_name', i.name,
            'unit_name', iu.name,
            'unit_abbreviation', iu.abbreviation
          ) ORDER BY co.display_order ASC, co.name ASC
        ) as options
      FROM customization_groups cg
      LEFT JOIN customization_options co ON cg.id = co.group_id
      LEFT JOIN ingredients i ON co.ingredient_id = i.id
      LEFT JOIN ingredient_units iu ON co.unit_id = iu.id
    `;

    const params: any[] = [];
    if (dishId) {
      queryText += ' WHERE cg.dish_id = $1';
      params.push(parseInt(dishId));
    }

    queryText += `
      GROUP BY cg.id
      ORDER BY cg.display_order ASC, cg.name ASC
    `;

    const result = await query(queryText, params);
    const groups = result.rows.map(row => ({
      ...row,
      options: row.options.filter((opt: any) => opt.id !== null)
    }));

    return NextResponse.json({ groups });

  } catch (error) {
    console.error('Error fetching customization groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customization groups' },
      { status: 500 }
    );
  }
}