# PlantMate Test Suite

This directory contains the test suite for the PlantMate backend API.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual functions
│   ├── controllers/       # Controller function tests
│   ├── models/           # Model tests
│   └── helpers/          # Helper function tests
├── integration/          # Integration tests for API endpoints
│   ├── auth/             # Authentication tests
│   ├── plants/           # Plant catalog and suggestions tests
│   ├── spaces/           # Spaces management tests
│   ├── userPlants/       # User plants management tests
│   ├── careTasks/        # Care tasks management tests
│   ├── calendar/         # Calendar events tests
│   └── dashboard/        # Dashboard statistics tests
└── fixtures/             # Test data and mock objects
```

## Test Categories

### 1. Unit Tests
- Controller function tests (individual route handlers)
- Model validation and schema tests
- Helper function tests
- Utility function tests

### 2. Integration Tests
- Authentication endpoints (register, login)
- Plant catalog endpoints
- Space management endpoints
- User plant management endpoints
- Care task management endpoints
- Calendar event management endpoints
- Dashboard statistics endpoints

## Running Tests

```bash
npm test
```

To run only unit tests:
```bash
npm test -- --testPathPattern=unit
```

To run only integration tests:
```bash
npm test -- --testPathPattern=integration
```

## Test Coverage

Current test coverage includes:
- Authentication flows (registration, login)
- CRUD operations for spaces
- Plant catalog retrieval
- Plant suggestions based on space criteria
- User plant management
- Care task management
- Calendar event management
- Dashboard statistics
- Error handling for invalid requests
- Authorization protection for protected endpoints
- Controller function unit tests
- Model schema validation tests
- Helper function unit tests

## Technologies Used

- Jest for test framework
- Supertest for HTTP assertions
- MongoDB in-memory server for database tests

## Documentation

- [UNIT_TESTS_GUIDE.md](UNIT_TESTS_GUIDE.md) - Guide for writing and running unit tests
- [TEST_SUMMARY.md](TEST_SUMMARY.md) - Detailed test coverage summary