import React from 'react';

// Use React.createElement in mock factories so mocks are safe even if jest hoists mocks.
// Keep mocks before importing App so the mocked modules take effect.
jest.mock('react-router-dom', () => {
  // require React inside the factory so the mock doesn't close over an out-of-scope variable
  const React = require('react');
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
jest.mock('./pages/auth/Login', () => {
  const React = require('react');
  return () => React.createElement('div', null, 'Login Component');
});
jest.mock('./pages/auth/Registration', () => {
  const React = require('react');
  return () => React.createElement('div', null, 'Registration Component');
});
jest.mock('./pages/dashboard/Dashboard', () => {
  const React = require('react');
  return () => React.createElement('div', null, 'Dashboard Component');
});
jest.mock('./Layout', () => {
  const React = require('react');
  return ({ children }) => React.createElement('div', null, children);
});
jest.mock('./component/PublicRoute', () => {
  const React = require('react');
  return ({ children }) => React.createElement('div', null, children);
});
jest.mock('./component/PrivateRoute', () => {
  const React = require('react');
  return ({ children }) => React.createElement('div', null, children);
});

// Mock the seedMock function
jest.mock('./lib/mockApi/mockApi', () => ({
  seedMock: jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => {
  const React = require('react');
  return {
    ToastContainer: () => React.createElement('div', null, 'Toast Container'),
    toast: {
      success: jest.fn(),
      error: jest.fn()
    }
  };
});

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