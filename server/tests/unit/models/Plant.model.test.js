// Unit tests for Plant model
const mongoose = require('mongoose');
const Plant = require('../../models/Plant');

describe('Plant Model', () => {
  // Test the Plant schema structure
  it('should have the correct schema structure', () => {
    const plantSchema = Plant.schema.obj;
    
    expect(plantSchema.slug).toEqual({ type: String, unique: true });
    expect(plantSchema.common_name).toEqual(String);
    expect(plantSchema.scientific_name).toEqual(String);
    expect(plantSchema.min_sun_hours).toEqual(Number);
    expect(plantSchema.max_sun_hours).toEqual(Number);
    expect(plantSchema.indoor_ok).toEqual(Boolean);
    
    // Test enum values
    expect(plantSchema.watering_need.enum).toEqual(['low', 'med', 'high']);
    expect(plantSchema.difficulty.enum).toEqual(['easy', 'med', 'hard']);
  });

  // Test that the model is correctly exported
  it('should be a valid Mongoose model', () => {
    expect(Plant).toBeDefined();
    expect(Plant.modelName).toBe('Plant');
  });
});