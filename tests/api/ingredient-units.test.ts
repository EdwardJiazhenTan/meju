import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/ingredient-units/route';

// Mock the database module
jest.mock('@/lib/database', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/database';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('/api/ingredient-units', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/ingredient-units', () => {
    it('should create a unit successfully', async () => {
      const mockUnit = {
        id: 1,
        name: 'grams',
        abbreviation: 'g',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockUnit] });

      const request = new NextRequest('http://localhost/api/ingredient-units', {
        method: 'POST',
        body: JSON.stringify({
          name: 'grams',
          abbreviation: 'g',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.unit).toEqual(mockUnit);
      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO ingredient_units (name, abbreviation)\n       VALUES ($1, $2)\n       RETURNING *',
        ['grams', 'g']
      );
    });

    it('should return 400 for missing name', async () => {
      const request = new NextRequest('http://localhost/api/ingredient-units', {
        method: 'POST',
        body: JSON.stringify({
          abbreviation: 'g',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });
  });

  describe('GET /api/ingredient-units', () => {
    it('should fetch all units', async () => {
      const mockUnits = [
        {
          id: 1,
          name: 'grams',
          abbreviation: 'g',
        },
        {
          id: 2,
          name: 'milliliters',
          abbreviation: 'ml',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockUnits });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.units).toEqual(mockUnits);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM ingredient_units \n       ORDER BY name ASC'
      );
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch ingredient units');
    });
  });
});