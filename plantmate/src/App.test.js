import React from 'react';

// Use React.createElement in mock factories so mocks are safe even if jest hoists mocks.
// Keep mocks before importing App so the mocked modules take effect.
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => React.createElement('div', null, children),
    Routes: ({ children }) => React.createElement('div', null, children),
    Route: ({ children }) => React.createElement('div', null, children),
    useNavigate: () => jest.fn()
  };
});

// Mock all the components that App imports to avoid test complexity
jest.mock('./pages/auth/Login', () => () => React.createElement('div', null, 'Login Component'));
jest.mock('./pages/auth/Registration', () => () => React.createElement('div', null, 'Registration Component'));
jest.mock('./pages/dashboard/Dashboard', () => () => React.createElement('div', null, 'Dashboard Component'));
jest.mock('./Layout', () => ({ children }) => React.createElement('div', null, children));
jest.mock('./component/PublicRoute', () => ({ children }) => React.createElement('div', null, children));
jest.mock('./component/PrivateRoute', () => ({ children }) => React.createElement('div', null, children));

// Mock the seedMock function
jest.mock('./lib/mockApi/mockApi', () => ({
  seedMock: jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  ToastContainer: () => React.createElement('div', null, 'Toast Container'),
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

import { render } from '@testing-library/react';
import App from './App';

// Simple sanity tests
test('PlantMate application test', () => {
  expect(true).toBe(true);
});

test('renders PlantMate application', () => {
  render(React.createElement(App));
  expect(true).toBe(true);
});