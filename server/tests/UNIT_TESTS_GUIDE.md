# Unit Tests Guide

This document explains the unit test structure for the PlantMate backend API.

## Test Structure

```
server/tests/
├── unit/                  # Unit tests
│   ├── controllers/       # Controller function tests
│   ├── models/           # Model method tests
│   └── helpers/          # Helper function tests
├── integration/          # Integration tests (API endpoints)
└── fixtures/             # Test data
```

## Difference Between Unit and Integration Tests

### Unit Tests
- Test individual functions or methods in isolation
- Mock external dependencies (database, APIs, etc.)
- Fast execution (milliseconds)
- Focus on business logic and edge cases
- Example: Testing a controller function without the Express app

### Integration Tests
- Test the complete flow of API endpoints
- Use real database connections (in-memory MongoDB)
- Slower execution (seconds)
- Test the interaction between multiple components
- Example: Testing a complete API endpoint with authentication

## Running Unit Tests

To run only unit tests:

```bash
cd server
npm test -- --testPathPattern=unit
```

To run all tests:

```bash
cd server
npm test
```

## Unit Test Examples

### Testing Controllers
Controllers should be tested without the Express app:

```javascript
// Mock dependencies
jest.mock('../../models/Plant');

// Import the function to test
const { listCatalog } = require('../../controllers/plants.controller');

// Test the function in isolation
it('should return all plants', async () => {
  // Arrange
  const mockPlants = [{ common_name: 'Basil' }];
  Plant.find.mockReturnValue({
    sort: jest.fn().mockResolvedValue(mockPlants)
  });
  
  const req = {};
  const res = { json: jest.fn() };
  
  // Act
  await listCatalog(req, res);
  
  // Assert
  expect(res.json).toHaveBeenCalledWith(mockPlants);
});
```

### Testing Models
Models should be tested for validation and schema structure:

```javascript
it('should have correct schema structure', () => {
  const plantSchema = Plant.schema.obj;
  expect(plantSchema.slug).toEqual({ type: String, unique: true });
});
```

### Testing Helpers
Helper functions should be tested for their specific functionality:

```javascript
it('should forward errors to next middleware', async () => {
  // Test error handling
});
```

## Best Practices

1. **One assertion per test** - Each test should verify one specific behavior
2. **Mock external dependencies** - Use `jest.mock()` to isolate the code under test
3. **Test edge cases** - Test with null, undefined, empty values
4. **Use descriptive test names** - Clearly state what is being tested
5. **Keep tests independent** - Tests should not rely on each other
6. **Clean up after tests** - Use `afterEach` to reset mocks

## Adding New Unit Tests

1. Create a new file in the appropriate subdirectory (`controllers`, `models`, `helpers`)
2. Name the file with `.test.js` extension
3. Follow the existing patterns for imports and structure
4. Write tests for each function or method
5. Run tests to ensure they pass