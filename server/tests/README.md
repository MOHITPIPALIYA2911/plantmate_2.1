# PlantMate Test Suite

This directory contains the test suite for the PlantMate backend API.

## Test Structure

```
tests/
├── unit/                 # Unit tests for individual functions
│   ├── models/           # Model tests
│   └── utils/            # Utility function tests
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
- Model validation tests
- Utility function tests
- Helper function tests

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

## Technologies Used

- Jest for test framework
- Supertest for HTTP assertions
- MongoDB in-memory server for database tests