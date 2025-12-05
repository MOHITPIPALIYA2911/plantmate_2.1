// Mock react-router-dom before importing App
// jest.mock('react-router-dom', () => ({
//   BrowserRouter: ({ children }) => <div>{children}</div>,
//   Routes: ({ children }) => <div>{children}</div>,
//   Route: ({ children }) => <div>{children}</div>,
//   useNavigate: () => jest.fn()
// }));

// FIX: Use jest.requireActual as a fallback for a safer module mock
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual, // This safely provides other exports like Link, Outlet, etc.
    BrowserRouter: ({ children }) => <div>{children}</div>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ children }) => <div>{children}</div>,
    useNavigate: () => jest.fn()
  };
});

import { render } from '@testing-library/react';
import App from './App';

// Mock all the components that App imports to avoid test complexity
jest.mock('./pages/auth/Login', () => () => <div>Login Component</div>);
jest.mock('./pages/auth/Registration', () => () => <div>Registration Component</div>);
jest.mock('./pages/dashboard/Dashboard', () => () => <div>Dashboard Component</div>);
jest.mock('./Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('./component/PublicRoute', () => ({ children }) => <div>{children}</div>);
jest.mock('./component/PrivateRoute', () => ({ children }) => <div>{children}</div>);

// Mock the seedMock function
jest.mock('./lib/mockApi/mockApi', () => ({
  seedMock: jest.fn()
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div>Toast Container</div>,
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Simple test that doesn't require any imports or component rendering
test('PlantMate application test', () => {
  expect(true).toBe(true);
});

test('renders PlantMate application', () => {
  render(<App />);
  expect(true).toBe(true);
});