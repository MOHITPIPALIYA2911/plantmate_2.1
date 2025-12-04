// testData.js - Test data fixtures
const testUsers = {
  validUser: {
    first_Name: 'John',
    LastName: 'Doe',
    emailId: 'john.doe@example.com',
    password: 'Password123!'
  },
  validUser2: {
    first_Name: 'Jane',
    LastName: 'Smith',
    emailId: 'jane.smith@example.com',
    password: 'Password456!'
  },
  missingFields: {
    first_Name: 'John'
    // Missing other required fields
  },
  invalidEmail: {
    first_Name: 'John',
    LastName: 'Doe',
    emailId: 'invalid-email',
    password: 'Password123!'
  }
};

const testSpaces = {
  validSpace: {
    name: 'My Balcony',
    type: 'balcony',
    direction: 'S',
    sunlight_hours: 6,
    area_sq_m: 10,
    notes: 'South facing balcony'
  },
  validSpace2: {
    name: 'Windowsill',
    type: 'windowsill',
    direction: 'E',
    sunlight_hours: 4,
    area_sq_m: 2,
    notes: 'Kitchen window'
  }
};

const testPlants = {
  basil: {
    slug: 'basil',
    common_name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    min_sun_hours: 4,
    max_sun_hours: 8,
    indoor_ok: true,
    watering_need: 'med',
    fertilization_freq_days: 30,
    pot_size_min_liters: 2,
    soil_type: 'well-draining',
    difficulty: 'easy',
    tags: ['herb', 'culinary']
  },
  tomato: {
    slug: 'tomato',
    common_name: 'Tomato',
    scientific_name: 'Solanum lycopersicum',
    min_sun_hours: 6,
    max_sun_hours: 10,
    indoor_ok: false,
    watering_need: 'high',
    fertilization_freq_days: 14,
    pot_size_min_liters: 10,
    soil_type: 'rich',
    difficulty: 'med',
    tags: ['vegetable', 'fruit']
  }
};

module.exports = {
  testUsers,
  testSpaces,
  testPlants
};