import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/ingredients/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/ingredients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ingredients', () => {
    it('should create an ingredient successfully', async () => {
      const mockIngredient = {
        id: 1,
        name: 'Chicken Breast',
        calories_per_unit: 165,
        default_unit_id: 1,
        category: 'Protein',
        created_at: '2025-09-11T20:35:07.778Z',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockIngredient] });

      const request = new NextRequest('http://localhost/api/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Chicken Breast',
          calories_per_unit: 165,
          default_unit_id: 1,
          category: 'Protein',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.ingredient).toEqual(mockIngredient);
    });

    it('should return 400 for missing name', async () => {
      const request = new NextRequest('http://localhost/api/ingredients', {
        method: 'POST',
        body: JSON.stringify({
          calories_per_unit: 165,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });
  });

  describe('GET /api/ingredients', () => {
    it('should fetch all ingredients', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: 'Chicken Breast',
          unit_name: 'grams',
          unit_abbreviation: 'g',
        },
        {
          id: 2,
          name: 'Rice',
          unit_name: 'grams',
          unit_abbreviation: 'g',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockIngredients });

      const request = new NextRequest('http://localhost/api/ingredients');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.ingredients).toEqual(mockIngredients);
    });

    it('should filter by search term', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: 'Chicken Breast',
          unit_name: 'grams',
          unit_abbreviation: 'g',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockIngredients });

      const request = new NextRequest('http://localhost/api/ingredients?search=chicken');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('i.name ILIKE $1'),
        ['%chicken%']
      );
    });

    it('should filter by category', async () => {
      const mockIngredients = [
        {
          id: 1,
          name: 'Chicken Breast',
          category: 'Protein',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockIngredients });

      const request = new NextRequest('http://localhost/api/ingredients?category=Protein');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('i.category = $1'),
        ['Protein']
      );
    });
  });
});