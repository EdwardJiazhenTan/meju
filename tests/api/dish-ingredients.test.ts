import { NextRequest } from 'next/server';
import { POST, GET, DELETE } from '@/app/api/dishes/[dishId]/ingredients/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/dishes/[dishId]/ingredients', () => {
  const params = { dishId: '1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dishes/[dishId]/ingredients', () => {
    it('should add ingredient to dish successfully', async () => {
      const mockDishIngredient = {
        id: 1,
        dish_id: 1,
        ingredient_id: 1,
        quantity: 200,
        unit_id: 1,
        is_optional: false,
      };

      // Mock dish exists check
      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] });
      // Mock ingredient insertion
      mockQuery.mockResolvedValueOnce({ rows: [mockDishIngredient] });

      const request = new NextRequest('http://localhost/api/dishes/1/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          ingredient_id: 1,
          quantity: 200,
          unit_id: 1,
          is_optional: false,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.dishIngredient).toEqual(mockDishIngredient);
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should return 404 for non-existent dish', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/dishes/999/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          ingredient_id: 1,
          quantity: 200,
          unit_id: 1,
        }),
      });

      const response = await POST(request, { params: { dishId: '999' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Dish not found');
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/dishes/1/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          ingredient_id: 1,
          // missing quantity and unit_id
        }),
      });

      const response = await POST(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ingredient_id, quantity, and unit_id are required');
    });
  });

  describe('GET /api/dishes/[dishId]/ingredients', () => {
    it('should fetch dish ingredients successfully', async () => {
      const mockIngredients = [
        {
          id: 1,
          dish_id: 1,
          ingredient_id: 1,
          quantity: 200,
          unit_id: 1,
          is_optional: false,
          ingredient_name: 'Chicken Breast',
          calories_per_unit: 165,
          ingredient_category: 'Protein',
          unit_name: 'grams',
          unit_abbreviation: 'g',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockIngredients });

      const request = new NextRequest('http://localhost/api/dishes/1/ingredients');
      const response = await GET(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ingredients).toEqual(mockIngredients);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE di.dish_id = $1'),
        [1]
      );
    });
  });

  describe('DELETE /api/dishes/[dishId]/ingredients', () => {
    it('should remove dish ingredient successfully', async () => {
      const mockDeletedIngredient = {
        id: 1,
        dish_id: 1,
        ingredient_id: 1,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockDeletedIngredient] });

      const request = new NextRequest('http://localhost/api/dishes/1/ingredients?ingredient_id=1');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Dish ingredient removed successfully');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM dish_ingredients'),
        [1, 1]
      );
    });

    it('should return 400 for missing ingredient_id', async () => {
      const request = new NextRequest('http://localhost/api/dishes/1/ingredients');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('ingredient_id parameter is required');
    });

    it('should return 404 for non-existent dish ingredient', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const request = new NextRequest('http://localhost/api/dishes/1/ingredients?ingredient_id=999');
      const response = await DELETE(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Dish ingredient not found');
    });
  });
});