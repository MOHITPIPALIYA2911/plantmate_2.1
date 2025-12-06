// Unit tests for helper functions
const { asyncHandler } = require('../../../controllers/_helpers');

describe('_helpers.js', () => {
  describe('asyncHandler', () => {
    it('should call the provided function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const handler = asyncHandler(mockFn);
      
      await handler({}, {}, () => {});
      
      expect(mockFn).toHaveBeenCalled();
    });

    it('should forward errors to next middleware', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const next = jest.fn();
      const handler = asyncHandler(mockFn);
      
      await handler({}, {}, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});