import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/dishes/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/dishes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/dishes', () => {
    it('should create a dish successfully', async () => {
      const mockDish = {
        id: 1,
        name: 'Chicken Salad',
        cooking_steps: 'Mix ingredients',
        category_id: 1,
        base_calories: 300,
        preparation_time: 15,
        servings: 2,
        is_customizable: true,
        created_at: '2025-09-11T20:35:07.778Z',
      };

      // Mock database responses
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockDish] }) // INSERT dish
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const request = new NextRequest('http://localhost/api/dishes', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Chicken Salad',
          cooking_steps: 'Mix ingredients',
          category_id: 1,
          base_calories: 300,
          preparation_time: 15,
          servings: 2,
          is_customizable: true,
          ingredients: [],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.dish).toEqual(mockDish);
      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should create a dish with ingredients', async () => {
      const mockDish = {
        id: 1,
        name: 'Chicken Salad',
        servings: 2,
        is_customizable: true,
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [mockDish] }) // INSERT dish
        .mockResolvedValueOnce({ rows: [] }) // INSERT ingredient 1
        .mockResolvedValueOnce({ rows: [] }) // INSERT ingredient 2
        .mockResolvedValueOnce({ rows: [] }); // COMMIT

      const request = new NextRequest('http://localhost/api/dishes', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Chicken Salad',
          servings: 2,
          is_customizable: true,
          ingredients: [
            { ingredient_id: 1, quantity: 200, unit_id: 1, is_optional: false },
            { ingredient_id: 2, quantity: 100, unit_id: 1, is_optional: true },
          ],
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
      expect(mockQuery).toHaveBeenCalledTimes(5);
    });

    it('should return 400 for missing required fields', async () => {
      const request = new NextRequest('http://localhost/api/dishes', {
        method: 'POST',
        body: JSON.stringify({
          cooking_steps: 'Mix ingredients',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name and servings are required');
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/dishes', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Dish',
          servings: 1,
          is_customizable: false,
          ingredients: [],
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create dish');
    });
  });

  describe('GET /api/dishes', () => {
    it('should fetch all dishes successfully', async () => {
      const mockDishes = [
        {
          id: 1,
          name: 'Chicken Salad',
          category_name: 'Salads',
          created_at: '2025-09-11T20:35:07.797Z',
        },
        {
          id: 2,
          name: 'Beef Stir Fry',
          category_name: 'Main Course',
          created_at: '2025-09-11T20:35:07.797Z',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockDishes });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.dishes).toEqual(mockDishes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT d.*, c.name as category_name')
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch dishes');
    });
  });
});