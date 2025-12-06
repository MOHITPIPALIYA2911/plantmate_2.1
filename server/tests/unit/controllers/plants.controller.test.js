// Unit tests for plants controller
const Plant = require('../../models/Plant');
const { listCatalog } = require('../../controllers/plants.controller');

// Mock the Plant model
jest.mock('../../models/Plant');

describe('plants.controller.js', () => {
  describe('listCatalog', () => {
    it('should return all plants sorted by common name', async () => {
      const mockPlants = [
        { common_name: 'Basil', scientific_name: 'Ocimum basilicum' },
        { common_name: 'Aloe Vera', scientific_name: 'Aloe barbadensis' }
      ];
      
      Plant.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockPlants)
      });

      const req = {};
      const res = {
        json: jest.fn()
      };
      const next = jest.fn();

      await listCatalog(req, res, next);

      expect(Plant.find).toHaveBeenCalledWith({});
      expect(res.json).toHaveBeenCalledWith(mockPlants);
    });
  });
});